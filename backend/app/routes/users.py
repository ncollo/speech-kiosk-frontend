import re

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import audit, current_user, require_admin
from app.models import ROLES, STAFF_STATUSES, HospitalUser
from app.security import hash_pin, random_pin

router = APIRouter(prefix="/api/users", tags=["Hospital staff directory"])

BADGE_PREFIX = {
    "Hospital Administrator": "ADMIN",
    "Triage Nurse": "NURSE",
    "Reception Officer": "RECEP",
    "Medical Doctor": "DOC",
    "KSL Interpreter": "KSL",
    "Audiology Specialist": "SPEC",
}


class UserCreate(BaseModel):
    name: str = Field(min_length=3, max_length=128)
    role: str
    department: str = Field(min_length=2, max_length=160)
    phone: str | None = Field(default=None, max_length=32)
    email: str | None = Field(default=None, max_length=160)
    pin: str | None = Field(default=None, pattern=r"^\d{4,6}$")


class UserUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=3, max_length=128)
    role: str | None = None
    department: str | None = Field(default=None, min_length=2, max_length=160)
    phone: str | None = Field(default=None, max_length=32)
    status: str | None = None
    is_active: bool | None = None


def _next_user_id(db: Session) -> str:
    nums = [int(i.split("-")[1]) for (i,) in db.query(HospitalUser.id).all() if i.split("-")[-1].isdigit()]
    return f"USR-{(max(nums) if nums else 0) + 1:02d}"


def _next_badge(db: Session, role: str) -> str:
    prefix = BADGE_PREFIX[role]
    nums = [
        int(b.split("-")[1])
        for (b,) in db.query(HospitalUser.badge_id).filter(HospitalUser.badge_id.like(f"{prefix}-%")).all()
        if b.split("-")[-1].isdigit()
    ]
    nxt = (max(nums) + 1) if nums else 1
    return f"{prefix}-{nxt:03d}"


@router.get("")
def list_users(
    role: str | None = None,
    status: str | None = None,
    search: str | None = Query(default=None, max_length=80),
    _: HospitalUser = Depends(current_user),
    db: Session = Depends(get_db),
):
    q = db.query(HospitalUser)
    if role and role != "All":
        q = q.filter(HospitalUser.role == role)
    if status and status != "All":
        q = q.filter(HospitalUser.status == status)
    if search:
        like = f"%{search.strip()}%"
        q = q.filter(
            or_(
                HospitalUser.name.ilike(like),
                HospitalUser.badge_id.ilike(like),
                HospitalUser.department.ilike(like),
                HospitalUser.email.ilike(like),
            )
        )
    return [u.to_dict() for u in q.order_by(HospitalUser.id).all()]


@router.post("", status_code=201)
def create_user(body: UserCreate, admin: HospitalUser = Depends(require_admin), db: Session = Depends(get_db)):
    if body.role not in ROLES:
        raise HTTPException(status_code=422, detail=f"Role must be one of {ROLES}")
    base = re.sub(r"^(dr|nurse)\.?\s+", "", body.name.strip(), flags=re.I).lower().split()
    local = f"{base[0][0]}.{base[-1]}" if len(base) > 1 else base[0]
    email = (body.email or f"{re.sub(r'[^a-z.]', '', local)}@knh.or.ke").lower()
    if db.query(HospitalUser).filter(HospitalUser.email == email).first():
        email = email.replace("@", f"{db.query(HospitalUser).count() + 1}@")
    pin = body.pin or random_pin()
    user = HospitalUser(
        id=_next_user_id(db),
        badge_id=_next_badge(db, body.role),
        name=body.name.strip(),
        role=body.role,
        department=body.department.strip(),
        email=email,
        phone=(body.phone or "").strip() or "Not provided",
        status="Offline",
        pin_hash=hash_pin(pin),
    )
    db.add(user)
    audit(db, "USER_CREATED", f"{admin.name} registered {user.name} ({user.role}, {user.badge_id}).", actor=admin)
    db.commit()
    return {"user": user.to_dict(), "pin": pin}


@router.patch("/{user_id}")
def update_user(user_id: str, body: UserUpdate, admin: HospitalUser = Depends(require_admin), db: Session = Depends(get_db)):
    user = db.get(HospitalUser, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Staff member not found")
    changes = body.model_dump(exclude_unset=True)
    if "role" in changes and changes["role"] not in ROLES:
        raise HTTPException(status_code=422, detail=f"Role must be one of {ROLES}")
    if "status" in changes and changes["status"] not in STAFF_STATUSES:
        raise HTTPException(status_code=422, detail=f"Status must be one of {STAFF_STATUSES}")
    if user.id == admin.id and (changes.get("is_active") is False or changes.get("role", user.role) != user.role):
        raise HTTPException(status_code=400, detail="You cannot deactivate or demote your own account")
    for key, value in changes.items():
        setattr(user, key, value.strip() if isinstance(value, str) else value)
    if changes.get("is_active") is False:
        user.status = "Offline"
    audit(db, "USER_UPDATED", f"{admin.name} updated {user.name}: {', '.join(changes) or 'no changes'}.", actor=admin)
    db.commit()
    return user.to_dict()


@router.post("/{user_id}/reset-pin")
def reset_pin(user_id: str, admin: HospitalUser = Depends(require_admin), db: Session = Depends(get_db)):
    user = db.get(HospitalUser, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Staff member not found")
    pin = random_pin()
    user.pin_hash = hash_pin(pin)
    audit(db, "PIN_RESET", f"{admin.name} reset the PIN for {user.name}.", actor=admin)
    db.commit()
    return {"user": user.to_dict(), "pin": pin}

