from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.config import settings
from app.db import get_db, utcnow
from app.deps import audit, current_user, get_session
from app.models import STAFF_STATUSES, HospitalUser, StaffSession
from app.security import new_token, verify_pin

router = APIRouter(prefix="/api/auth", tags=["Staff authentication"])


class LoginRequest(BaseModel):
    badge_id: str = Field(min_length=2, max_length=32)
    pin: str = Field(min_length=4, max_length=8)


class StatusRequest(BaseModel):
    status: str


@router.post("/login")
def login(body: LoginRequest, db: Session = Depends(get_db)):
    badge = body.badge_id.strip().upper()
    user = db.query(HospitalUser).filter(func.upper(HospitalUser.badge_id) == badge).first()
    if not user or not verify_pin(body.pin.strip(), user.pin_hash):
        audit(db, "LOGIN_FAILED", f"Failed sign-in attempt for badge {badge}.")
        db.commit()
        raise HTTPException(status_code=401, detail="Badge ID or PIN is incorrect")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="This account has been deactivated. Contact an administrator.")

    now = utcnow()
    sess = StaffSession(token=new_token(), user_id=user.id, created_at=now, expires_at=now + timedelta(hours=settings.SESSION_HOURS))
    user.last_login_at = now
    if user.status == "Offline":
        user.status = "On-Duty"
    db.add(sess)
    audit(db, "LOGIN", f"{user.name} ({user.role}) signed in.", actor=user)
    db.commit()
    return {
        "token": sess.token,
        "expiresAt": sess.expires_at.isoformat(),
        "portal": "admin" if user.is_admin else "staff",
        "user": user.to_dict(),
    }


@router.get("/me")
def me(user: HospitalUser = Depends(current_user)):
    return {"portal": "admin" if user.is_admin else "staff", "user": user.to_dict()}


@router.patch("/me/status")
def set_my_status(body: StatusRequest, sess: StaffSession = Depends(get_session), db: Session = Depends(get_db)):
    if body.status not in STAFF_STATUSES:
        raise HTTPException(status_code=422, detail=f"Status must be one of {STAFF_STATUSES}")
    user = db.get(HospitalUser, sess.user_id)
    user.status = body.status
    audit(db, "STAFF_STATUS", f"{user.name} set status to {body.status}.", actor=user)
    db.commit()
    return user.to_dict()


@router.post("/logout")
def logout(sess: StaffSession = Depends(get_session), db: Session = Depends(get_db)):
    sess = db.get(StaffSession, sess.token)
    sess.revoked = True
    user = db.get(HospitalUser, sess.user_id)
    user.status = "Offline"
    audit(db, "LOGOUT", f"{user.name} signed out.", actor=user)
    db.commit()
    return {"ok": True}

