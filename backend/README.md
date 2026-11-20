# ClearCaption Hospital Kiosk — Backend (`./backend`)

Standalone FastAPI + SQLAlchemy 2.0 + PostgreSQL backend for the ClearCaption Hospital Reception Kiosk, Clinician Triage Console, and Hospital Administration Suite.

## Features
- **50 Seeded Hospital Staff Users** across 6 roles (`Hospital Administrator`, `Triage Nurse`, `Reception Officer`, `Medical Doctor`, `KSL Interpreter`, `Audiology Specialist`) with PBKDF2-SHA256 hashed PINs and Bearer session tokens.
- **30 Seeded Patient Triage Intakes** with full Swahili/English bilingual complaints, body map locations, urgency flags, and turn-by-turn transcripts.
- **6 Kiosk Fleet Terminals** (`TERM-01` to `TERM-06`, Desks 1–6) with live heartbeat polling, latency reporting, and bidirectional nurse-to-tablet messaging.
- **KSL Interpreter Dispatch Workflow** (`Pending` → `Dispatched` → `Resolved`) synchronized in real time between patient tablets and clinician consoles.
- **DPA Compliance Audit Trail** logging logins, patient check-ins, status transitions, interpreter dispatches, and 30-second privacy wipes.

## Quickstart

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

## Running Tests

```bash
python -m pytest backend/tests -v
```

