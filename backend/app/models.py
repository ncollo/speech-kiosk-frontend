import json
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base, iso, utcnow

ROLES = [
    "Hospital Administrator",
    "Triage Nurse",
    "Reception Officer",
    "Medical Doctor",
    "KSL Interpreter",
    "Audiology Specialist",
]
STAFF_STATUSES = ["Active", "On-Duty", "Break", "Offline"]
PATIENT_STATUSES = ["Checking In", "Waiting", "In Triage", "With Doctor", "Pharmacy", "Admitted", "Discharged", "Completed"]
INTERPRETER_STATUSES = ["Pending", "Dispatched", "Resolved"]


class SchemaMeta(Base):
    __tablename__ = "schema_meta"
    key: Mapped[str] = mapped_column(String(64), primary_key=True)
    value: Mapped[str] = mapped_column(String(64))


class HospitalUser(Base):
    __tablename__ = "hospital_users"

    id: Mapped[str] = mapped_column(String(16), primary_key=True)
    badge_id: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(128))
    role: Mapped[str] = mapped_column(String(64), index=True)
    department: Mapped[str] = mapped_column(String(160))
    email: Mapped[str] = mapped_column(String(160), unique=True)
    phone: Mapped[str] = mapped_column(String(32))
    status: Mapped[str] = mapped_column(String(16), default="Offline")
    pin_hash: Mapped[str] = mapped_column(String(256))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    @property
    def is_admin(self) -> bool:
        return self.role == "Hospital Administrator"

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "badgeId": self.badge_id,
            "name": self.name,
            "role": self.role,
            "department": self.department,
            "email": self.email,
            "phone": self.phone,
            "status": self.status,
            "isActive": self.is_active,
            "lastLoginAt": iso(self.last_login_at),
            "createdAt": iso(self.created_at),
        }


class StaffSession(Base):
    __tablename__ = "staff_sessions"

    token: Mapped[str] = mapped_column(String(96), primary_key=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("hospital_users.id", ondelete="CASCADE"), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    revoked: Mapped[bool] = mapped_column(Boolean, default=False)

    user: Mapped[HospitalUser] = relationship()


class KioskTerminal(Base):
    __tablename__ = "kiosk_terminals"

    id: Mapped[str] = mapped_column(String(16), primary_key=True)
    desk: Mapped[str] = mapped_column(String(32), unique=True)
    location: Mapped[str] = mapped_column(String(128))
    device_type: Mapped[str] = mapped_column(String(96))
    microphone: Mapped[str] = mapped_column(String(96))
    assigned_user_id: Mapped[str | None] = mapped_column(ForeignKey("hospital_users.id", ondelete="SET NULL"), nullable=True)
    mic_status: Mapped[str] = mapped_column(String(24), default="ready")
    last_heartbeat_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    latency_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)

    assigned_user: Mapped[HospitalUser | None] = relationship()


class TriagePatient(Base):
    __tablename__ = "triage_patients"

    id: Mapped[str] = mapped_column(String(16), primary_key=True)
    name: Mapped[str] = mapped_column(String(128))
    symptom: Mapped[str | None] = mapped_column(String(128), nullable=True)
    symptom_sw: Mapped[str | None] = mapped_column(String(128), nullable=True)
    places: Mapped[str] = mapped_column(Text, default="[]")
    duration: Mapped[str | None] = mapped_column(String(96), nullable=True)
    urgent: Mapped[bool] = mapped_column(Boolean, default=False)
    desk: Mapped[str] = mapped_column(String(32), index=True)
    terminal_id: Mapped[str | None] = mapped_column(ForeignKey("kiosk_terminals.id", ondelete="SET NULL"), nullable=True)
    lang: Mapped[str] = mapped_column(String(64), default="English")
    status: Mapped[str] = mapped_column(String(16), default="Checking In", index=True)
    consent_given: Mapped[bool] = mapped_column(Boolean, default=True)
    consent_recorded_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    summary_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    diagnosis: Mapped[str | None] = mapped_column(String(240), nullable=True)
    prescription: Mapped[str | None] = mapped_column(Text, nullable=True)
    disposition: Mapped[str | None] = mapped_column(String(64), nullable=True)
    ward: Mapped[str | None] = mapped_column(String(128), nullable=True)
    assigned_to_id: Mapped[str | None] = mapped_column(ForeignKey("hospital_users.id", ondelete="SET NULL"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    assigned_to: Mapped[HospitalUser | None] = relationship()
    turns: Mapped[list["TranscriptTurn"]] = relationship(
        back_populates="patient", cascade="all, delete-orphan", order_by="TranscriptTurn.id"
    )

    def places_list(self) -> list[str]:
        try:
            value = json.loads(self.places or "[]")
            return value if isinstance(value, list) else []
        except ValueError:
            return []

    def to_dict(self, with_transcript: bool = False) -> dict:
        data = {
            "id": self.id,
            "name": self.name,
            "symptom": self.symptom,
            "symptomSw": self.symptom_sw,
            "places": self.places_list(),
            "duration": self.duration,
            "urgent": self.urgent,
            "desk": self.desk,
            "terminalId": self.terminal_id,
            "lang": self.lang,
            "status": self.status,
            "consentGiven": self.consent_given,
            "consentRecordedAt": iso(self.consent_recorded_at),
            "summaryNotes": self.summary_notes,
            "diagnosis": self.diagnosis,
            "prescription": self.prescription,
            "disposition": self.disposition,
            "ward": self.ward,
            "assignedTo": self.assigned_to.name if self.assigned_to else None,
            "createdAt": iso(self.created_at),
            "updatedAt": iso(self.updated_at),
        }
        if with_transcript:
            data["transcript"] = [t.to_dict() for t in self.turns]
        return data


class TranscriptTurn(Base):
    __tablename__ = "transcript_turns"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    patient_id: Mapped[str] = mapped_column(ForeignKey("triage_patients.id", ondelete="CASCADE"), index=True)
    speaker: Mapped[str] = mapped_column(String(16))  # nurse | patient | system
    channel: Mapped[str] = mapped_column(String(24))  # spoken | keypad | card | body-map | chips | message
    text: Mapped[str] = mapped_column(Text)
    confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    is_uncertain: Mapped[bool] = mapped_column(Boolean, default=False)
    original_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    edited_by_id: Mapped[str | None] = mapped_column(ForeignKey("hospital_users.id", ondelete="SET NULL"), nullable=True)
    edited_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    patient: Mapped[TriagePatient] = relationship(back_populates="turns")
    edited_by: Mapped[HospitalUser | None] = relationship()

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "speaker": self.speaker,
            "channel": self.channel,
            "text": self.text,
            "confidence": self.confidence,
            "isUncertain": self.is_uncertain,
            "originalText": self.original_text,
            "editedBy": self.edited_by.name if self.edited_by else None,
            "editedAt": iso(self.edited_at),
            "createdAt": iso(self.created_at),
        }


class DeskMessage(Base):
    """A message typed by staff that is shown on a kiosk tablet."""

    __tablename__ = "desk_messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    terminal_id: Mapped[str] = mapped_column(ForeignKey("kiosk_terminals.id", ondelete="CASCADE"), index=True)
    patient_id: Mapped[str | None] = mapped_column(ForeignKey("triage_patients.id", ondelete="SET NULL"), nullable=True)
    sender_id: Mapped[str | None] = mapped_column(ForeignKey("hospital_users.id", ondelete="SET NULL"), nullable=True)
    text: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    sender: Mapped[HospitalUser | None] = relationship()

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "terminalId": self.terminal_id,
            "patientId": self.patient_id,
            "sender": self.sender.name if self.sender else "Reception",
            "text": self.text,
            "createdAt": iso(self.created_at),
        }


class InterpreterRequest(Base):
    __tablename__ = "interpreter_requests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    desk: Mapped[str] = mapped_column(String(32))
    patient_id: Mapped[str | None] = mapped_column(ForeignKey("triage_patients.id", ondelete="SET NULL"), nullable=True)
    source: Mapped[str] = mapped_column(String(16))  # kiosk | staff
    requested_by_id: Mapped[str | None] = mapped_column(ForeignKey("hospital_users.id", ondelete="SET NULL"), nullable=True)
    handled_by_id: Mapped[str | None] = mapped_column(ForeignKey("hospital_users.id", ondelete="SET NULL"), nullable=True)
    status: Mapped[str] = mapped_column(String(16), default="Pending", index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    patient: Mapped[TriagePatient | None] = relationship()
    requested_by: Mapped[HospitalUser | None] = relationship(foreign_keys=[requested_by_id])
    handled_by: Mapped[HospitalUser | None] = relationship(foreign_keys=[handled_by_id])

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "desk": self.desk,
            "patientId": self.patient_id,
            "patientName": self.patient.name if self.patient else None,
            "source": self.source,
            "requestedBy": self.requested_by.name if self.requested_by else "Patient (kiosk)",
            "handledBy": self.handled_by.name if self.handled_by else None,
            "status": self.status,
            "createdAt": iso(self.created_at),
            "updatedAt": iso(self.updated_at),
        }


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, index=True)
    event_type: Mapped[str] = mapped_column(String(48), index=True)
    actor_id: Mapped[str | None] = mapped_column(String(16), nullable=True)
    actor_name: Mapped[str | None] = mapped_column(String(128), nullable=True)
    terminal_id: Mapped[str | None] = mapped_column(String(16), nullable=True)
    patient_id: Mapped[str | None] = mapped_column(String(16), nullable=True)
    details: Mapped[str] = mapped_column(Text)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "createdAt": iso(self.created_at),
            "eventType": self.event_type,
            "actorId": self.actor_id,
            "actorName": self.actor_name,
            "terminalId": self.terminal_id,
            "patientId": self.patient_id,
            "details": self.details,
        }



class SymptomCard(Base):
    """Standardised pictorial symptom cards managed by Hospital Administrators."""

    __tablename__ = "symptom_cards"

    id: Mapped[str] = mapped_column(String(16), primary_key=True)
    en: Mapped[str] = mapped_column(String(96), unique=True)
    sw: Mapped[str] = mapped_column(String(96))
    icon_key: Mapped[str] = mapped_column(String(48), default="heartbeat")
    keywords: Mapped[str] = mapped_column(Text, default="[]")
    urgent: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    def keywords_list(self) -> list[str]:
        try:
            value = json.loads(self.keywords or "[]")
            return [str(v).strip().lower() for v in value if str(v).strip()] if isinstance(value, list) else []
        except ValueError:
            return []

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "en": self.en,
            "sw": self.sw,
            "iconKey": self.icon_key,
            "keywords": self.keywords_list(),
            "urgent": self.urgent,
            "isActive": self.is_active,
            "sortOrder": self.sort_order,
            "createdAt": iso(self.created_at),
            "updatedAt": iso(self.updated_at),
        }


class KslVideoPrompt(Base):
    """Pre-recorded Kenyan Sign Language (KSL) video prompts for common triage questions."""

    __tablename__ = "ksl_video_prompts"

    id: Mapped[str] = mapped_column(String(16), primary_key=True)
    title: Mapped[str] = mapped_column(String(128))
    question_en: Mapped[str] = mapped_column(String(240))
    question_sw: Mapped[str] = mapped_column(String(240))
    ksl_gloss: Mapped[str] = mapped_column(String(240), default="")
    trigger_keywords: Mapped[str] = mapped_column(Text, default="[]")
    video_url: Mapped[str] = mapped_column(String(256), default="")
    duration_sec: Mapped[int] = mapped_column(Integer, default=5)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    def keywords_list(self) -> list[str]:
        try:
            value = json.loads(self.trigger_keywords or "[]")
            return [str(v).strip().lower() for v in value if str(v).strip()] if isinstance(value, list) else []
        except ValueError:
            return []

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "title": self.title,
            "questionEn": self.question_en,
            "questionSw": self.question_sw,
            "kslGloss": self.ksl_gloss,
            "triggerKeywords": self.keywords_list(),
            "videoUrl": self.video_url,
            "durationSec": self.duration_sec,
            "isActive": self.is_active,
            "sortOrder": self.sort_order,
            "createdAt": iso(self.created_at),
            "updatedAt": iso(self.updated_at),
        }
