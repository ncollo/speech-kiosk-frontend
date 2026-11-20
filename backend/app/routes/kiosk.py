"""Endpoints used by the patient-facing kiosk tablets (no staff login)."""

import json

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.db import get_db, utcnow
from app.deps import audit
from app.models import DeskMessage, InterpreterRequest, KioskTerminal, TranscriptTurn, TriagePatient
from app.ws import hub

router = APIRouter(prefix="/api/kiosk", tags=["Kiosk tablets"])

SPEAKERS = {"nurse", "patient", "system"}
CHANNELS = {"spoken", "keypad", "card", "body-map", "chips", "message"}


class IntakeStart(BaseModel):
    lang: str = Field(default="English", max_length=64)
    consent_given: bool = True


class IntakeUpdate(BaseModel):
    name: str | None = Field(default=None, max_length=128)
    symptom: str | None = Field(default=None, max_length=128)
    symptom_sw: str | None = Field(default=None, max_length=128)
    places: list[str] | None = None
    duration: str | None = Field(default=None, max_length=96)
    urgent: bool | None = None
    lang: str | None = Field(default=None, max_length=64)
    complete: bool = False


class TurnIn(BaseModel):
    speaker: str
    channel: str
    text: str = Field(min_length=1, max_length=2000)
    confidence: float | None = Field(default=None, ge=0.0, le=1.0)
    is_uncertain: bool = False


class InterpreterIn(BaseModel):
    patient_id: str | None = None


class WipeIn(BaseModel):
    patient_id: str | None = None


def _terminal(db: Session, terminal_id: str) -> KioskTerminal:
    t = db.get(KioskTerminal, terminal_id.upper())
    if not t:
        raise HTTPException(status_code=404, detail=f"Unknown kiosk terminal {terminal_id}")
    return t


def _kiosk_patient(db: Session, patient_id: str) -> TriagePatient:
    p = db.get(TriagePatient, patient_id)
    if not p:
        raise HTTPException(status_code=404, detail="Intake not found")
    return p


def _next_patient_id(db: Session) -> str:
    nums = [int(i.split("-")[1]) for (i,) in db.query(TriagePatient.id).all() if i.split("-")[-1].isdigit()]
    return f"PT-{(max(nums) if nums else 1000) + 1}"


@router.get("/terminals")
def kiosk_terminals(db: Session = Depends(get_db)):
    """Public list so a tablet can be configured for a desk."""
    return [{"id": t.id, "desk": t.desk, "location": t.location} for t in db.query(KioskTerminal).order_by(KioskTerminal.id)]


@router.get("/{terminal_id}/poll")
def poll(
    terminal_id: str,
    after: int = Query(default=-1),
    patient_id: str | None = None,
    latency_ms: int | None = Query(default=None, ge=0, le=60000),
    db: Session = Depends(get_db),
):
    """Heartbeat + fetch new staff messages and interpreter status for this tablet.

    Pass ``after=-1`` on first load to receive only the current cursor.
    """
    t = _terminal(db, terminal_id)
    t.last_heartbeat_at = utcnow()
    if latency_ms is not None:
        t.latency_ms = latency_ms
    db.commit()

    q = db.query(DeskMessage).filter(DeskMessage.terminal_id == t.id)
    latest = q.order_by(DeskMessage.id.desc()).first()
    latest_id = latest.id if latest else 0
    messages = [] if after < 0 else [m.to_dict() for m in q.filter(DeskMessage.id > after).order_by(DeskMessage.id).limit(20)]

    interpreter = None
    if patient_id:
        req = (
            db.query(InterpreterRequest)
            .filter(InterpreterRequest.patient_id == patient_id)
            .order_by(InterpreterRequest.id.desc())
            .first()
        )
        interpreter = req.to_dict() if req else None

    return {
        "terminal": {"id": t.id, "desk": t.desk, "location": t.location, "micStatus": t.mic_status},
        "latestId": latest_id,
        "messages": messages,
        "interpreter": interpreter,
        "serverTime": utcnow().isoformat(),
    }


@router.post("/{terminal_id}/intakes", status_code=201)
def start_intake(terminal_id: str, body: IntakeStart, db: Session = Depends(get_db)):
    t = _terminal(db, terminal_id)
    p = TriagePatient(
        id=_next_patient_id(db),
        name="New patient",
        desk=t.desk,
        terminal_id=t.id,
        lang=body.lang,
        status="Checking In",
        consent_given=body.consent_given,
        consent_recorded_at=utcnow(),
        assigned_to_id=t.assigned_user_id,
    )
    db.add(p)
    consent_note = "storage consent accepted" if body.consent_given else "storage consent declined (ephemeral)"
    audit(db, "INTAKE_STARTED", f"Patient began self check-in at {t.desk} ({consent_note}).", terminal_id=t.id, patient_id=p.id)
    db.commit()
    return p.to_dict()


@router.patch("/intakes/{patient_id}")
def update_intake(patient_id: str, body: IntakeUpdate, db: Session = Depends(get_db)):
    p = _kiosk_patient(db, patient_id)
    data = body.model_dump(exclude_unset=True)
    complete = data.pop("complete", False)
    if p.status != "Checking In" and any(k in data for k in ("name", "symptom", "places", "duration")):
        raise HTTPException(status_code=409, detail="This intake has already been handed to the nurse")
    if "places" in data:
        p.places = json.dumps(data.pop("places"))
    for key, value in data.items():
        if value is not None:
            setattr(p, key, value.strip() if isinstance(value, str) else value)
    if body.urgent:
        p.urgent = True
    if complete and p.status == "Checking In":
        p.status = "Waiting"
        audit(
            db,
            "INTAKE_COMPLETED",
            f"{p.name} completed check-in at {p.desk}: {p.symptom or 'no complaint stated'}{' (URGENT)' if p.urgent else ''}.",
            terminal_id=p.terminal_id,
            patient_id=p.id,
        )
    db.commit()
    return p.to_dict()


@router.post("/intakes/{patient_id}/turns", status_code=201)
def add_turn(patient_id: str, body: TurnIn, db: Session = Depends(get_db)):
    if body.speaker not in SPEAKERS or body.channel not in CHANNELS:
        raise HTTPException(status_code=422, detail="Invalid speaker or channel")
    p = _kiosk_patient(db, patient_id)
    turn = TranscriptTurn(
        patient_id=p.id,
        speaker=body.speaker,
        channel=body.channel,
        text=body.text.strip(),
        confidence=body.confidence,
        is_uncertain=body.is_uncertain or (body.confidence is not None and body.confidence < 0.78),
    )
    db.add(turn)
    p.updated_at = utcnow()
    db.commit()
    payload = turn.to_dict()
    if p.terminal_id:
        hub.broadcast_sync(p.terminal_id, {"type": "turn_added", "patientId": p.id, "turn": payload})
    return payload


@router.post("/{terminal_id}/interpreter", status_code=201)
def request_interpreter(terminal_id: str, body: InterpreterIn, db: Session = Depends(get_db)):
    t = _terminal(db, terminal_id)
    patient = db.get(TriagePatient, body.patient_id) if body.patient_id else None
    existing = (
        db.query(InterpreterRequest)
        .filter(InterpreterRequest.desk == t.desk, InterpreterRequest.status.in_(["Pending", "Dispatched"]))
        .filter(InterpreterRequest.patient_id == (patient.id if patient else None))
        .first()
    )
    if existing:
        return existing.to_dict()
    req = InterpreterRequest(desk=t.desk, patient_id=patient.id if patient else None, source="kiosk")
    db.add(req)
    if patient:
        db.add(TranscriptTurn(patient_id=patient.id, speaker="system", channel="message", text="Patient requested a KSL interpreter from the tablet."))
    audit(db, "INTERPRETER_REQUESTED", f"KSL interpreter requested from the {t.desk} tablet.", terminal_id=t.id, patient_id=req.patient_id)
    db.commit()
    return req.to_dict()


@router.post("/{terminal_id}/wipe")
def wipe(terminal_id: str, body: WipeIn, db: Session = Depends(get_db)):
    """Called when the tablet clears itself. Unconsented or unfinished intakes are purged."""
    t = _terminal(db, terminal_id)
    detail = f"{t.desk} tablet cleared its screen and local memory."
    purged = False
    if body.patient_id:
        p = db.get(TriagePatient, body.patient_id)
        if p and (not p.consent_given or p.status == "Checking In"):
            was_unconsented = not p.consent_given
            db.delete(p)
            purged = True
            if was_unconsented:
                detail += " Session transcripts and record purged per patient consent decline (DPA 2019)."
                audit(db, "CONSENT_PURGED", detail, terminal_id=t.id)
                db.commit()
                return {"ok": True, "purged": True}
            detail += " Unfinished check-in was discarded."
    audit(db, "SCREEN_WIPED", detail, terminal_id=t.id)
    db.commit()
    return {"ok": True, "purged": purged}

