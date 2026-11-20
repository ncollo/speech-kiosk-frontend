from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.config import settings
from app.db import as_utc, get_db, iso, utcnow
from app.deps import audit, current_user
from app.models import (
    INTERPRETER_STATUSES,
    AuditLog,
    DeskMessage,
    HospitalUser,
    InterpreterRequest,
    KioskTerminal,
    TranscriptTurn,
    TriagePatient,
)
from app.ws import hub

router = APIRouter(tags=["Hospital operations"])


class MessageIn(BaseModel):
    text: str = Field(min_length=1, max_length=280)
    patient_id: str | None = None


class InterpreterCreate(BaseModel):
    desk: str
    patient_id: str | None = None


class InterpreterUpdate(BaseModel):
    status: str


def _start_of_today():
    now = utcnow()
    return now - timedelta(hours=24)


def _is_online(t: KioskTerminal) -> bool:
    hb = as_utc(t.last_heartbeat_at)
    return bool(hb and (utcnow() - hb).total_seconds() <= settings.KIOSK_ONLINE_SECONDS)


# ---------- Kiosk fleet ----------
@router.get("/api/terminals")
def list_terminals(_: HospitalUser = Depends(current_user), db: Session = Depends(get_db)):
    since = _start_of_today()
    counts = dict(
        db.query(TriagePatient.terminal_id, func.count(TriagePatient.id))
        .filter(TriagePatient.created_at >= since)
        .group_by(TriagePatient.terminal_id)
        .all()
    )
    active = dict(
        db.query(TriagePatient.terminal_id, func.count(TriagePatient.id))
        .filter(TriagePatient.status == "Checking In")
        .group_by(TriagePatient.terminal_id)
        .all()
    )
    out = []
    for t in db.query(KioskTerminal).order_by(KioskTerminal.id).all():
        out.append(
            {
                "id": t.id,
                "desk": t.desk,
                "location": t.location,
                "deviceType": t.device_type,
                "microphone": t.microphone,
                "micStatus": t.mic_status,
                "assignedTo": t.assigned_user.name if t.assigned_user else None,
                "online": _is_online(t),
                "inSession": bool(active.get(t.id)),
                "lastHeartbeatAt": iso(t.last_heartbeat_at),
                "latencyMs": t.latency_ms,
                "intakes24h": counts.get(t.id, 0),
            }
        )
    return out


@router.post("/api/terminals/{terminal_id}/messages", status_code=201)
def send_message(terminal_id: str, body: MessageIn, user: HospitalUser = Depends(current_user), db: Session = Depends(get_db)):
    t = db.get(KioskTerminal, terminal_id)
    if not t:
        raise HTTPException(status_code=404, detail="Kiosk terminal not found")
    patient = db.get(TriagePatient, body.patient_id) if body.patient_id else None
    msg = DeskMessage(terminal_id=t.id, patient_id=patient.id if patient else None, sender_id=user.id, text=body.text.strip())
    db.add(msg)
    if patient:
        db.add(TranscriptTurn(patient_id=patient.id, speaker="nurse", channel="message", text=body.text.strip()))
    audit(db, "DESK_MESSAGE", f"{user.name} sent a message to the {t.desk} tablet.", actor=user, terminal_id=t.id, patient_id=msg.patient_id)
    db.commit()
    payload = {**msg.to_dict(), "online": _is_online(t)}
    hub.broadcast_sync(t.id, {"type": "desk_message", "message": payload})
    return payload


@router.get("/api/terminals/{terminal_id}/messages")
def list_messages(terminal_id: str, _: HospitalUser = Depends(current_user), db: Session = Depends(get_db)):
    rows = db.query(DeskMessage).filter(DeskMessage.terminal_id == terminal_id).order_by(DeskMessage.id.desc()).limit(20).all()
    return [m.to_dict() for m in rows]


# ---------- Interpreter requests ----------
@router.get("/api/interpreter-requests")
def list_interpreter_requests(open_only: bool = True, _: HospitalUser = Depends(current_user), db: Session = Depends(get_db)):
    q = db.query(InterpreterRequest)
    if open_only:
        q = q.filter(InterpreterRequest.status != "Resolved")
    return [r.to_dict() for r in q.order_by(InterpreterRequest.id.desc()).limit(50).all()]


@router.post("/api/interpreter-requests", status_code=201)
def create_interpreter_request(body: InterpreterCreate, user: HospitalUser = Depends(current_user), db: Session = Depends(get_db)):
    t = db.query(KioskTerminal).filter(KioskTerminal.desk == body.desk).first()
    if not t:
        raise HTTPException(status_code=404, detail="Unknown desk")
    existing = (
        db.query(InterpreterRequest)
        .filter(InterpreterRequest.desk == body.desk, InterpreterRequest.patient_id == body.patient_id)
        .filter(InterpreterRequest.status.in_(["Pending", "Dispatched"]))
        .first()
    )
    if existing:
        return existing.to_dict()
    req = InterpreterRequest(desk=body.desk, patient_id=body.patient_id, source="staff", requested_by_id=user.id)
    db.add(req)
    audit(db, "INTERPRETER_REQUESTED", f"{user.name} requested a KSL interpreter for {body.desk}.", actor=user, terminal_id=t.id, patient_id=body.patient_id)
    db.commit()
    return req.to_dict()


@router.patch("/api/interpreter-requests/{request_id}")
def update_interpreter_request(request_id: int, body: InterpreterUpdate, user: HospitalUser = Depends(current_user), db: Session = Depends(get_db)):
    if body.status not in INTERPRETER_STATUSES:
        raise HTTPException(status_code=422, detail=f"Status must be one of {INTERPRETER_STATUSES}")
    req = db.get(InterpreterRequest, request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    req.status = body.status
    req.handled_by_id = user.id
    t = db.query(KioskTerminal).filter(KioskTerminal.desk == req.desk).first()
    if body.status == "Dispatched" and t:
        text = "A Kenyan Sign Language interpreter is on the way to your desk."
        db.add(DeskMessage(terminal_id=t.id, patient_id=req.patient_id, sender_id=user.id, text=text))
        if req.patient_id:
            db.add(TranscriptTurn(patient_id=req.patient_id, speaker="system", channel="message", text=f"{user.name} dispatched a KSL interpreter."))
    audit(db, "INTERPRETER_" + body.status.upper(), f"{user.name} marked the {req.desk} interpreter request as {body.status}.", actor=user, terminal_id=t.id if t else None, patient_id=req.patient_id)
    db.commit()
    return req.to_dict()


# ---------- Audit & statistics ----------
@router.get("/api/audit/logs")
def audit_logs(limit: int = 100, event_type: str | None = None, _: HospitalUser = Depends(current_user), db: Session = Depends(get_db)):
    q = db.query(AuditLog)
    if event_type and event_type != "all":
        q = q.filter(AuditLog.event_type == event_type)
    return [a.to_dict() for a in q.order_by(AuditLog.id.desc()).limit(min(max(limit, 1), 500)).all()]


@router.get("/api/stats")
def stats(_: HospitalUser = Depends(current_user), db: Session = Depends(get_db)):
    since = _start_of_today()
    terminals = db.query(KioskTerminal).all()
    status_counts = dict(db.query(HospitalUser.status, func.count(HospitalUser.id)).group_by(HospitalUser.status).all())
    patient_counts = dict(db.query(TriagePatient.status, func.count(TriagePatient.id)).group_by(TriagePatient.status).all())
    wipes = db.query(func.count(AuditLog.id)).filter(AuditLog.event_type == "SCREEN_WIPED", AuditLog.created_at >= since).scalar()
    return {
        "staffTotal": db.query(func.count(HospitalUser.id)).scalar(),
        "staffOnDuty": status_counts.get("On-Duty", 0) + status_counts.get("Active", 0),
        "staffByStatus": status_counts,
        "kiosksTotal": len(terminals),
        "kiosksOnline": sum(1 for t in terminals if _is_online(t)),
        "intakes24h": db.query(func.count(TriagePatient.id)).filter(TriagePatient.created_at >= since).scalar(),
        "urgentOpen": db.query(func.count(TriagePatient.id)).filter(TriagePatient.urgent.is_(True), TriagePatient.status != "Completed").scalar(),
        "patientsByStatus": patient_counts,
        "interpreterOpen": db.query(func.count(InterpreterRequest.id)).filter(InterpreterRequest.status != "Resolved").scalar(),
        "screenWipes24h": wipes,
    }

