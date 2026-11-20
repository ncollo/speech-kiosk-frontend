"""Symptom cards and KSL video prompt catalog + admin management + keyword matching."""

import json
import re
import secrets
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import audit, require_admin
from app.models import HospitalUser, KslVideoPrompt, SymptomCard

router = APIRouter(prefix="/api/catalog", tags=["Catalog & KSL Media"])

MEDIA_DIR = Path(__file__).resolve().parent.parent.parent / "media" / "ksl"
MEDIA_DIR.mkdir(parents=True, exist_ok=True)
ALLOWED_VIDEO_EXTS = {".mp4", ".webm", ".ogg", ".mov"}


class SymptomCardIn(BaseModel):
    en: str = Field(min_length=2, max_length=96)
    sw: str = Field(min_length=2, max_length=96)
    icon_key: str = Field(default="heartbeat", max_length=48)
    keywords: list[str] = Field(default_factory=list)
    urgent: bool = False
    is_active: bool = True
    sort_order: int = 0


class SymptomCardPatch(BaseModel):
    en: str | None = Field(default=None, min_length=2, max_length=96)
    sw: str | None = Field(default=None, min_length=2, max_length=96)
    icon_key: str | None = Field(default=None, max_length=48)
    keywords: list[str] | None = None
    urgent: bool | None = None
    is_active: bool | None = None
    sort_order: int | None = None


class KslPromptIn(BaseModel):
    title: str = Field(min_length=2, max_length=128)
    question_en: str = Field(min_length=2, max_length=240)
    question_sw: str = Field(min_length=2, max_length=240)
    ksl_gloss: str = Field(default="", max_length=240)
    trigger_keywords: list[str] = Field(default_factory=list)
    video_url: str = Field(default="", max_length=256)
    duration_sec: int = Field(default=5, ge=1, le=120)
    is_active: bool = True
    sort_order: int = 0


class KslPromptPatch(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=128)
    question_en: str | None = Field(default=None, min_length=2, max_length=240)
    question_sw: str | None = Field(default=None, min_length=2, max_length=240)
    ksl_gloss: str | None = Field(default=None, max_length=240)
    trigger_keywords: list[str] | None = None
    video_url: str | None = Field(default=None, max_length=256)
    duration_sec: int | None = Field(default=None, ge=1, le=120)
    is_active: bool | None = None
    sort_order: int | None = None


class MatchRequest(BaseModel):
    text: str = Field(min_length=1, max_length=1000)


def _next_id(existing_ids: list[str], prefix: str) -> str:
    nums = [int(m.group(1)) for i in existing_ids if (m := re.search(rf"{prefix}-(\d+)", i))]
    return f"{prefix}-{max(nums, default=0) + 1:02d}"


def _clean_keywords(items: list[str]) -> list[str]:
    seen: list[str] = []
    for raw in items:
        kw = raw.strip().lower()
        if kw and kw not in seen:
            seen.append(kw)
    return seen


@router.get("/symptom-cards")
def list_symptom_cards(include_inactive: bool = False, db: Session = Depends(get_db)):
    q = db.query(SymptomCard)
    if not include_inactive:
        q = q.filter(SymptomCard.is_active.is_(True))
    rows = q.order_by(SymptomCard.sort_order.asc(), SymptomCard.id.asc()).all()
    return {"items": [r.to_dict() for r in rows]}


@router.post("/symptom-cards", status_code=201)
def create_symptom_card(body: SymptomCardIn, admin: HospitalUser = Depends(require_admin), db: Session = Depends(get_db)):
    if db.query(SymptomCard).filter(SymptomCard.en.ilike(body.en.strip())).first():
        raise HTTPException(status_code=409, detail="A symptom card with this English label already exists")
    existing = [r[0] for r in db.query(SymptomCard.id).all()]
    card = SymptomCard(
        id=_next_id(existing, "SYM"),
        en=body.en.strip(),
        sw=body.sw.strip(),
        icon_key=body.icon_key.strip() or "heartbeat",
        keywords=json.dumps(_clean_keywords(body.keywords)),
        urgent=body.urgent,
        is_active=body.is_active,
        sort_order=body.sort_order or (len(existing) + 1),
    )
    db.add(card)
    audit(db, "SYMPTOM_CARD_CREATED", f"{admin.name} created symptom card '{card.en}'.", actor=admin)
    db.commit()
    return card.to_dict()


@router.patch("/symptom-cards/{card_id}")
def update_symptom_card(card_id: str, body: SymptomCardPatch, admin: HospitalUser = Depends(require_admin), db: Session = Depends(get_db)):
    card = db.get(SymptomCard, card_id)
    if not card:
        raise HTTPException(status_code=404, detail="Symptom card not found")
    data = body.model_dump(exclude_unset=True)
    if "keywords" in data and data["keywords"] is not None:
        card.keywords = json.dumps(_clean_keywords(data.pop("keywords")))
    for k, v in data.items():
        if v is not None:
            setattr(card, k, v.strip() if isinstance(v, str) else v)
    audit(db, "SYMPTOM_CARD_UPDATED", f"{admin.name} updated symptom card '{card.en}' (active={card.is_active}).", actor=admin)
    db.commit()
    return card.to_dict()


@router.delete("/symptom-cards/{card_id}")
def delete_symptom_card(card_id: str, admin: HospitalUser = Depends(require_admin), db: Session = Depends(get_db)):
    card = db.get(SymptomCard, card_id)
    if not card:
        raise HTTPException(status_code=404, detail="Symptom card not found")
    name = card.en
    db.delete(card)
    audit(db, "SYMPTOM_CARD_DELETED", f"{admin.name} deleted symptom card '{name}' ({card_id}).", actor=admin)
    db.commit()
    return {"ok": True}


@router.get("/ksl-prompts")
def list_ksl_prompts(include_inactive: bool = False, db: Session = Depends(get_db)):
    q = db.query(KslVideoPrompt)
    if not include_inactive:
        q = q.filter(KslVideoPrompt.is_active.is_(True))
    rows = q.order_by(KslVideoPrompt.sort_order.asc(), KslVideoPrompt.id.asc()).all()
    return {"items": [r.to_dict() for r in rows]}


@router.post("/ksl-prompts", status_code=201)
def create_ksl_prompt(body: KslPromptIn, admin: HospitalUser = Depends(require_admin), db: Session = Depends(get_db)):
    existing = [r[0] for r in db.query(KslVideoPrompt.id).all()]
    pid = _next_id(existing, "KSL")
    prompt = KslVideoPrompt(
        id=pid,
        title=body.title.strip(),
        question_en=body.question_en.strip(),
        question_sw=body.question_sw.strip(),
        ksl_gloss=body.ksl_gloss.strip() or body.title.upper(),
        trigger_keywords=json.dumps(_clean_keywords(body.trigger_keywords)),
        video_url=body.video_url.strip() or f"builtin://{pid.lower()}",
        duration_sec=body.duration_sec,
        is_active=body.is_active,
        sort_order=body.sort_order or (len(existing) + 1),
    )
    db.add(prompt)
    audit(db, "KSL_PROMPT_CREATED", f"{admin.name} added KSL video prompt '{prompt.title}'.", actor=admin)
    db.commit()
    return prompt.to_dict()


@router.patch("/ksl-prompts/{prompt_id}")
def update_ksl_prompt(prompt_id: str, body: KslPromptPatch, admin: HospitalUser = Depends(require_admin), db: Session = Depends(get_db)):
    prompt = db.get(KslVideoPrompt, prompt_id)
    if not prompt:
        raise HTTPException(status_code=404, detail="KSL prompt not found")
    data = body.model_dump(exclude_unset=True)
    if "trigger_keywords" in data and data["trigger_keywords"] is not None:
        prompt.trigger_keywords = json.dumps(_clean_keywords(data.pop("trigger_keywords")))
    for k, v in data.items():
        if v is not None:
            setattr(prompt, k, v.strip() if isinstance(v, str) else v)
    audit(db, "KSL_PROMPT_UPDATED", f"{admin.name} updated KSL prompt '{prompt.title}' (active={prompt.is_active}).", actor=admin)
    db.commit()
    return prompt.to_dict()


@router.delete("/ksl-prompts/{prompt_id}")
def delete_ksl_prompt(prompt_id: str, admin: HospitalUser = Depends(require_admin), db: Session = Depends(get_db)):
    prompt = db.get(KslVideoPrompt, prompt_id)
    if not prompt:
        raise HTTPException(status_code=404, detail="KSL prompt not found")
    title = prompt.title
    db.delete(prompt)
    audit(db, "KSL_PROMPT_DELETED", f"{admin.name} deleted KSL prompt '{title}' ({prompt_id}).", actor=admin)
    db.commit()
    return {"ok": True}


@router.post("/ksl-prompts/{prompt_id}/upload")
def upload_ksl_video(
    prompt_id: str,
    file: UploadFile = File(...),
    admin: HospitalUser = Depends(require_admin),
    db: Session = Depends(get_db),
):
    prompt = db.get(KslVideoPrompt, prompt_id)
    if not prompt:
        raise HTTPException(status_code=404, detail="KSL prompt not found")
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_VIDEO_EXTS:
        raise HTTPException(status_code=422, detail=f"Unsupported video format. Allowed: {', '.join(sorted(ALLOWED_VIDEO_EXTS))}")
    filename = f"{prompt_id.lower()}-{secrets.token_hex(4)}{ext}"
    dest = MEDIA_DIR / filename
    with dest.open("wb") as out:
        out.write(file.file.read())
    prompt.video_url = f"/api/catalog/ksl-media/{filename}"
    audit(db, "KSL_VIDEO_UPLOADED", f"{admin.name} uploaded KSL video '{filename}' for {prompt.title}.", actor=admin)
    db.commit()
    return prompt.to_dict()


@router.get("/ksl-media/{filename}")
def get_ksl_media(filename: str):
    safe_name = Path(filename).name
    target = MEDIA_DIR / safe_name
    if not target.exists() or not target.is_file():
        raise HTTPException(status_code=404, detail="Media file not found")
    return FileResponse(target)


@router.post("/match")
def match_conversation_text(body: MatchRequest, db: Session = Depends(get_db)):
    """Match spoken/typed conversation text against active symptom cards and KSL prompts."""
    lowered = body.text.lower()
    matched_cards: list[dict] = []
    for card in db.query(SymptomCard).filter(SymptomCard.is_active.is_(True)).order_by(SymptomCard.sort_order.asc()).all():
        kws = card.keywords_list()
        if any(kw in lowered for kw in kws) or card.en.lower() in lowered or card.sw.lower() in lowered:
            matched_cards.append(card.to_dict())

    matched_ksl: dict | None = None
    best_score = 0
    for prompt in db.query(KslVideoPrompt).filter(KslVideoPrompt.is_active.is_(True)).order_by(KslVideoPrompt.sort_order.asc()).all():
        score = sum(1 for kw in prompt.keywords_list() if kw in lowered)
        if score > best_score:
            best_score = score
            matched_ksl = prompt.to_dict()

    return {"matchedCards": matched_cards, "matchedKslPrompt": matched_ksl}

