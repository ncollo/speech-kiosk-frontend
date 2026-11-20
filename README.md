# ClearCaption — AI Speech-to-Text Captioning Kiosk for Hospital Reception

An accessible, real-time speech-to-text captioning kiosk and clinical triage platform designed for Deaf and hard-of-hearing patients at hospital reception desks.

This repository contains the complete full-stack system:
- **Frontend (`./src`)**: React 19 + TypeScript + Vite + Tailwind v4 interface for the Landing Page, Patient Reception Kiosk (`#/kiosk`), Clinician Triage Console (`#/staff`), and Hospital Administration Suite (`#/admin`).
- **Backend (`./backend`)**: Self-contained FastAPI + SQLAlchemy 2.0 + PostgreSQL 16 API service with PBKDF2-SHA256 PIN authentication, 50 seeded hospital staff accounts, 30 patient triage records with full turn-by-turn transcripts, 6 reception kiosk terminals, KSL interpreter dispatch queue, and DPA compliance audit logs.

---

## 🚀 Quickstart

### 1. Start the Backend (`./backend`)
```bash
npm run backend
# or directly:
# python -m uvicorn app.main:app --app-dir backend --reload --host 0.0.0.0 --port 8000
```
- **API Base**: `http://localhost:8000`
- **Swagger UI**: `http://localhost:8000/docs`
- **Database**: Connects automatically to PostgreSQL (`DATABASE_URL` in `backend/.env`), with automatic fallback to local SQLite (`backend/clearcaption.db`) if PostgreSQL is offline.

### 2. Start the Frontend
```bash
npm install
npm run dev
```
- **Frontend URL**: `http://localhost:5173` (Vite automatically proxies all `/api/*` requests to `http://127.0.0.1:8000`).

---

## 🔑 Staff & Admin Credentials (50 Hospital Staff Accounts)

| Role | Sample Badge ID | Access PIN | Count |
| :--- | :--- | :--- | :---: |
| **Hospital Administrator** | `ADMIN-001` .. `ADMIN-004` | `9900` | 4 |
| **Triage Nurse** | `NURSE-4029` .. `NURSE-4042` | `4821` | 14 |
| **Reception Officer** | `RECEP-101` .. `RECEP-109` | `1234` | 9 |
| **Medical Doctor** | `DOC-201` .. `DOC-210` | `1234` | 10 |
| **KSL Interpreter** | `KSL-301` .. `KSL-307` | `1234` | 7 |
| **Audiology Specialist** | `SPEC-501` .. `SPEC-506` | `1234` | 6 |
| **Total Seeded Staff** | | | **50** |

---

## 🧭 Application Routes

- **`#/`** — Hospital Landing Page & Interactive Kiosk Preview
- **`#/kiosk`** (or `#/kiosk?terminal=TERM-01..TERM-06`) — Live Patient Check-In Kiosk Tablet (persists turns, body map regions, symptom cards, KSL interpreter requests, and 30s privacy wipes directly to PostgreSQL; receives live nurse messages)
- **`#/staff`** — Clinician Triage Console (live queue, real-time transcript stream, tablet messaging, KSL interpreter dispatch, status & clinician assignment)
- **`#/admin`** — Hospital Administration Suite (manage all 50+ staff accounts, add staff, reset PINs, enable/disable accounts, inspect patient registry, monitor 6 kiosk terminals, and audit DPA logs)

---

## 🧪 Running Tests & Build

```bash
# Backend integration test suite (8 end-to-end API tests)
npm run backend:test

# Frontend production build & typecheck
npm run build
```
