from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import or_
from sqlalchemy.orm import Session, selectinload

from app.db import get_db, utcnow
from app.deps import audit, current_user
from app.models import PATIENT_STATUSES, HospitalUser, TranscriptTurn, TriagePatient
from app.ws import hub

router = APIRouter(prefix="/api/patients", tags=["Patient triage queue"])


class StatusUpdate(BaseModel):
    status: str


class AssignUpdate(BaseModel):
    assign_to_me: bool = True


class ClinicianTurnIn(BaseModel):
    text: str = Field(min_length=1, max_length=2000)
    confidence: float | None = Field(default=None, ge=0.0, le=1.0)
    is_uncertain: bool = False
    channel: str = Field(default="spoken", max_length=24)


class TurnEditIn(BaseModel):
    text: str = Field(min_length=1, max_length=2000)


class EndSessionIn(BaseModel):
    summary_notes: str | None = Field(default=None, max_length=2000)


class DispositionIn(BaseModel):
    action: str = Field(pattern="^(pharmacy|discharged|admitted)$")
    diagnosis: str | None = Field(default=None, max_length=240)
    prescription: str | None = Field(default=None, max_length=2000)
    ward: str | None = Field(default=None, max_length=128)
    notes: str | None = Field(default=None, max_length=2000)


@router.get("")
def list_patients(
    status: str | None = None,
    desk: str | None = None,
    urgent: bool | None = None,
    active: bool = False,
    search: str | None = Query(default=None, max_length=80),
    limit: int = Query(default=200, ge=1, le=500),
    _: HospitalUser = Depends(current_user),
    db: Session = Depends(get_db),
):
    q = db.query(TriagePatient).options(selectinload(TriagePatient.assigned_to))
    if status and status != "all":
        q = q.filter(TriagePatient.status == status)
    if active:
        q = q.filter(TriagePatient.status != "Completed")
    if desk and desk != "all":
        q = q.filter(TriagePatient.desk == desk)
    if urgent is not None:
        q = q.filter(TriagePatient.urgent == urgent)
    if search:
        like = f"%{search.strip()}%"
        q = q.filter(
            or_(
                TriagePatient.name.ilike(like),
                TriagePatient.symptom.ilike(like),
                TriagePatient.symptom_sw.ilike(like),
                TriagePatient.id.ilike(like),
                TriagePatient.desk.ilike(like),
            )
        )
    rows = q.order_by(TriagePatient.created_at.desc()).limit(limit).all()
    return [p.to_dict() for p in rows]


@router.get("/{patient_id}")
def get_patient(patient_id: str, _: HospitalUser = Depends(current_user), db: Session = Depends(get_db)):
    p = db.get(TriagePatient, patient_id)
    if not p:
        raise HTTPException(status_code=404, detail="Patient record not found")
    return p.to_dict(with_transcript=True)


@router.patch("/{patient_id}/status")
def update_status(patient_id: str, body: StatusUpdate, user: HospitalUser = Depends(current_user), db: Session = Depends(get_db)):
    if body.status not in PATIENT_STATUSES:
        raise HTTPException(status_code=422, detail=f"Status must be one of {PATIENT_STATUSES}")
    p = db.get(TriagePatient, patient_id)
    if not p:
        raise HTTPException(status_code=404, detail="Patient record not found")
    previous = p.status
    p.status = body.status
    if p.assigned_to_id is None:
        p.assigned_to_id = user.id
    audit(db, "PATIENT_STATUS", f"{user.name} moved {p.name} from {previous} to {body.status}.", actor=user, terminal_id=p.terminal_id, patient_id=p.id)
    db.commit()
    return p.to_dict()


@router.patch("/{patient_id}/assign")
def assign(patient_id: str, body: AssignUpdate, user: HospitalUser = Depends(current_user), db: Session = Depends(get_db)):
    p = db.get(TriagePatient, patient_id)
    if not p:
        raise HTTPException(status_code=404, detail="Patient record not found")
    p.assigned_to_id = user.id if body.assign_to_me else None
    audit(db, "PATIENT_ASSIGNED", f"{p.name} {'assigned to' if body.assign_to_me else 'unassigned from'} {user.name}.", actor=user, patient_id=p.id)
    db.commit()
    return p.to_dict()



@router.post("/{patient_id}/turns", status_code=201)
def add_clinician_turn(patient_id: str, body: ClinicianTurnIn, user: HospitalUser = Depends(current_user), db: Session = Depends(get_db)):
    p = db.get(TriagePatient, patient_id)
    if not p:
        raise HTTPException(status_code=404, detail="Patient record not found")
    uncertain = body.is_uncertain or (body.confidence is not None and body.confidence < 0.78)
    turn = TranscriptTurn(
        patient_id=p.id,
        speaker="nurse",
        channel=body.channel,
        text=body.text.strip(),
        confidence=body.confidence,
        is_uncertain=uncertain,
    )
    db.add(turn)
    p.updated_at = utcnow()
    db.commit()
    payload = turn.to_dict()
    if p.terminal_id:
        hub.broadcast_sync(p.terminal_id, {"type": "turn_added", "patientId": p.id, "turn": payload})
    return payload


@router.patch("/{patient_id}/turns/{turn_id}")
def edit_turn(patient_id: str, turn_id: int, body: TurnEditIn, user: HospitalUser = Depends(current_user), db: Session = Depends(get_db)):
    """Clinician inline correction of misrecognized ASR medical terms."""
    turn = db.get(TranscriptTurn, turn_id)
    if not turn or turn.patient_id != patient_id:
        raise HTTPException(status_code=404, detail="Transcript turn not found")
    if turn.original_text is None:
        turn.original_text = turn.text
    turn.text = body.text.strip()
    turn.is_uncertain = False
    turn.edited_by_id = user.id
    turn.edited_at = utcnow()
    p = db.get(TriagePatient, patient_id)
    audit(db, "TURN_EDITED", f"{user.name} corrected caption #{turn_id} for {p.name if p else patient_id}.", actor=user, terminal_id=p.terminal_id if p else None, patient_id=patient_id)
    db.commit()
    payload = turn.to_dict()
    if p and p.terminal_id:
        hub.broadcast_sync(p.terminal_id, {"type": "turn_edited", "patientId": p.id, "turn": payload})
    return payload


@router.post("/{patient_id}/repeat-caption")
def repeat_caption(patient_id: str, user: HospitalUser = Depends(current_user), db: Session = Depends(get_db)):
    """Re-send the latest nurse caption to the patient-facing kiosk screen."""
    p = db.get(TriagePatient, patient_id)
    if not p:
        raise HTTPException(status_code=404, detail="Patient record not found")
    last_nurse = (
        db.query(TranscriptTurn)
        .filter(TranscriptTurn.patient_id == patient_id, TranscriptTurn.speaker == "nurse")
        .order_by(TranscriptTurn.id.desc())
        .first()
    )
    if not last_nurse:
        raise HTTPException(status_code=404, detail="No nurse caption to repeat")
    audit(db, "CAPTION_REPEATED", f"{user.name} repeated last caption on {p.desk}.", actor=user, terminal_id=p.terminal_id, patient_id=p.id)
    db.commit()
    if p.terminal_id:
        hub.broadcast_sync(p.terminal_id, {"type": "repeat_caption", "patientId": p.id, "text": last_nurse.text, "turn": last_nurse.to_dict()})
    return {"ok": True, "text": last_nurse.text, "turn": last_nurse.to_dict()}


@router.post("/{patient_id}/end-session")
def end_session(patient_id: str, body: EndSessionIn | None = None, user: HospitalUser = Depends(current_user), db: Session = Depends(get_db)):
    """End a dual-display session: store summary if consented, or purge immediately if declined."""
    p = db.get(TriagePatient, patient_id)
    if not p:
        raise HTTPException(status_code=404, detail="Patient record not found")
    terminal_id = p.terminal_id
    if not p.consent_given:
        audit(
            db,
            "CONSENT_PURGED",
            f"{user.name} ended session for {p.id} ({p.desk}); unconsented transcripts purged per DPA 2019.",
            actor=user,
            terminal_id=terminal_id,
        )
        db.delete(p)
        db.commit()
        if terminal_id:
            hub.broadcast_sync(terminal_id, {"type": "session_ended", "patientId": patient_id, "purged": True})
        return {"ok": True, "purged": True, "patientId": patient_id}

    if p.status == "Checking In":
        p.status = "Waiting"
    if body and body.summary_notes:
        p.summary_notes = body.summary_notes.strip()
    if p.assigned_to_id is None:
        p.assigned_to_id = user.id
    audit(
        db,
        "SESSION_ENDED",
        f"{user.name} ended session for {p.name} ({p.id}) and generated triage summary.",
        actor=user,
        terminal_id=terminal_id,
        patient_id=p.id,
    )
    db.commit()
    summary = p.to_dict(with_transcript=True)
    if terminal_id:
        hub.broadcast_sync(terminal_id, {"type": "session_ended", "patientId": p.id, "purged": False, "patient": summary})
    return {"ok": True, "purged": False, "patient": summary}


@router.post("/{patient_id}/disposition")
def set_disposition(patient_id: str, body: DispositionIn, user: HospitalUser = Depends(current_user), db: Session = Depends(get_db)):
    """Record clinical diagnosis, prescription/pharmacy handoff, discharge, or ward admission."""
    p = db.get(TriagePatient, patient_id)
    if not p:
        raise HTTPException(status_code=404, detail="Patient record not found")

    if body.diagnosis is not None:
        p.diagnosis = body.diagnosis.strip() or None
    if body.prescription is not None:
        p.prescription = body.prescription.strip() or None
    if body.notes is not None:
        p.summary_notes = body.notes.strip() or p.summary_notes
    if p.assigned_to_id is None:
        p.assigned_to_id = user.id

    if body.action == "pharmacy":
        p.status = "Pharmacy"
        p.disposition = "Sent to Pharmacy"
        p.ward = None
        patient_msg = (
            f"Please take this prescription to the pharmacy: {p.prescription or 'See clinician instructions'}."
        )
        event_type = "PRESCRIPTION_ISSUED"
    elif body.action == "discharged":
        p.status = "Discharged"
        p.disposition = "Discharged with Medication"
        p.ward = None
        patient_msg = (
            f"Your medicine has been dispensed ({p.prescription or 'as prescribed'}). "
            "You are cleared to leave the hospital. Wishing you a quick recovery."
        )
        event_type = "PATIENT_DISCHARGED"
    else:
        p.status = "Admitted"
        p.disposition = "Admitted to Ward"
        p.ward = (body.ward or "General Medical Ward 2").strip()
        patient_msg = (
            f"You are being admitted to {p.ward} for further monitoring and treatment. "
            "A nurse will escort you to your bed."
        )
        event_type = "PATIENT_ADMITTED"

    turn = TranscriptTurn(patient_id=p.id, speaker="nurse", channel="message", text=patient_msg)
    db.add(turn)
    audit(
        db,
        event_type,
        f"{user.name} updated {p.name} ({p.id}): {p.disposition}"
        + (f" · Ward: {p.ward}" if p.ward else "")
        + (f" · Rx: {p.prescription}" if p.prescription else ""),
        actor=user,
        terminal_id=p.terminal_id,
        patient_id=p.id,
    )
    db.commit()

    patient_dict = p.to_dict(with_transcript=True)
    if p.terminal_id:
        hub.broadcast_sync(
            p.terminal_id,
            {
                "type": "disposition_update",
                "patientId": p.id,
                "status": p.status,
                "disposition": p.disposition,
                "diagnosis": p.diagnosis,
                "prescription": p.prescription,
                "ward": p.ward,
                "message": patient_msg,
                "turn": turn.to_dict(),
            },
        )
    return patient_dict
