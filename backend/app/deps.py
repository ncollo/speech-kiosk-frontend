from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.db import as_utc, get_db, utcnow
from app.models import AuditLog, HospitalUser, StaffSession


def get_session(authorization: str | None = Header(default=None), db: Session = Depends(get_db)) -> StaffSession:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Sign in required")
    token = authorization[7:].strip()
    sess = db.get(StaffSession, token)
    if not sess or sess.revoked or as_utc(sess.expires_at) < utcnow():
        raise HTTPException(status_code=401, detail="Session expired. Please sign in again.")
    if not sess.user or not sess.user.is_active:
        raise HTTPException(status_code=401, detail="Account disabled")
    return sess


def current_user(sess: StaffSession = Depends(get_session)) -> HospitalUser:
    return sess.user


def require_admin(user: HospitalUser = Depends(current_user)) -> HospitalUser:
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Hospital Administrator access required")
    return user


def audit(
    db: Session,
    event_type: str,
    details: str,
    actor: HospitalUser | None = None,
    terminal_id: str | None = None,
    patient_id: str | None = None,
) -> None:
    db.add(
        AuditLog(
            event_type=event_type,
            details=details,
            actor_id=actor.id if actor else None,
            actor_name=actor.name if actor else None,
            terminal_id=terminal_id,
            patient_id=patient_id,
        )
    )

