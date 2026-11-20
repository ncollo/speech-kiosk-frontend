"""Database schema setup and seed data (50 staff, 30 patients, 6 kiosks)."""

import json
import logging
from datetime import timedelta

from sqlalchemy import inspect
from sqlalchemy.orm import Session

from app.db import Base, SessionLocal, engine, utcnow
from app.models import (
    AuditLog,
    HospitalUser,
    KioskTerminal,
    KslVideoPrompt,
    SchemaMeta,
    SymptomCard,
    TranscriptTurn,
    TriagePatient,
)
from app.security import hash_pin

log = logging.getLogger("clearcaption.seed")

SCHEMA_VERSION = "4"

# Demo PINs per role (each user can be given a new PIN by an administrator).
ROLE_PINS = {
    "Hospital Administrator": "9900",
    "Triage Nurse": "4821",
}
DEFAULT_PIN = "1234"

# (badge, name, role, department, email-local, phone, status, minutes since last login or None)
USERS = [
    ("ADMIN-001", "Dr. Geoffrey Mutiso", "Hospital Administrator", "Executive Medical Operations", "g.mutiso", "+254 711 001 001", "Active", 10),
    ("ADMIN-002", "Sarah Wambui", "Hospital Administrator", "Health Information & Systems", "s.wambui", "+254 711 001 002", "Active", 25),
    ("ADMIN-003", "David Kiprono", "Hospital Administrator", "Clinical Quality & Accessibility", "d.kiprono", "+254 711 001 003", "On-Duty", 60),
    ("ADMIN-004", "Lucy Wairimu", "Hospital Administrator", "Patient Experience Office", "l.wairimu", "+254 711 001 004", "Active", 95),
    ("NURSE-4029", "Nurse Joyce Mwangi", "Triage Nurse", "Desk 3 · Outpatient Reception", "j.mwangi", "+254 722 002 001", "On-Duty", 2),
    ("NURSE-4030", "Nurse Beatrice Akinyi", "Triage Nurse", "Desk 1 · Emergency Triage", "b.akinyi", "+254 722 002 002", "On-Duty", 12),
    ("NURSE-4031", "Nurse Grace Njeri", "Triage Nurse", "Desk 2 · Pediatric Reception", "g.njeri", "+254 722 002 003", "On-Duty", 30),
    ("NURSE-4032", "Nurse Mercy Korir", "Triage Nurse", "Desk 4 · Specialized Clinics", "m.korir", "+254 722 002 004", "Break", 120),
    ("NURSE-4033", "Nurse Agnes Wanjiku", "Triage Nurse", "Desk 3 · Outpatient Reception", "a.wanjiku", "+254 722 002 005", "Active", 45),
    ("NURSE-4034", "Nurse Esther Moraa", "Triage Nurse", "Desk 5 · Maternity Reception", "e.moraa", "+254 722 002 006", "On-Duty", 15),
    ("NURSE-4035", "Nurse Lilian Chepkemoi", "Triage Nurse", "Desk 6 · Surgical Outpatient", "l.chepkemoi", "+254 722 002 007", "Offline", 1440),
    ("NURSE-4036", "Nurse Catherine Nduta", "Triage Nurse", "Emergency Rapid Response", "c.nduta", "+254 722 002 008", "On-Duty", 5),
    ("NURSE-4037", "Nurse Damaris Wekesa", "Triage Nurse", "Desk 1 · Emergency Triage", "d.wekesa", "+254 722 002 009", "On-Duty", 18),
    ("NURSE-4038", "Nurse Phyllis Auma", "Triage Nurse", "Desk 2 · Pediatric Reception", "p.auma", "+254 722 002 010", "Active", 70),
    ("NURSE-4039", "Nurse Ruth Kendi", "Triage Nurse", "Desk 5 · Maternity Reception", "r.kendi", "+254 722 002 011", "Break", 140),
    ("NURSE-4040", "Nurse Josephine Atieno", "Triage Nurse", "Desk 4 · Specialized Clinics", "j.atieno", "+254 722 002 012", "On-Duty", 22),
    ("NURSE-4041", "Nurse Peter Ouma", "Triage Nurse", "Desk 6 · Surgical Outpatient", "p.ouma", "+254 722 002 013", "Offline", 2880),
    ("NURSE-4042", "Nurse Faith Jeptoo", "Triage Nurse", "Emergency Rapid Response", "f.jeptoo", "+254 722 002 014", "On-Duty", 9),
    ("RECEP-101", "Kevin Otieno", "Reception Officer", "Desk 1 · Emergency Front Counter", "k.otieno", "+254 733 003 001", "On-Duty", 1),
    ("RECEP-102", "Maryanne Achieng", "Reception Officer", "Desk 3 · Main Outpatient Lobby", "m.achieng", "+254 733 003 002", "On-Duty", 3),
    ("RECEP-103", "Samuel Kilonzo", "Reception Officer", "Desk 2 · Pediatric Registration", "s.kilonzo", "+254 733 003 003", "Active", 18),
    ("RECEP-104", "Brenda Mutheu", "Reception Officer", "Desk 4 · ENT & Specialized Desk", "b.mutheu", "+254 733 003 004", "On-Duty", 22),
    ("RECEP-105", "Collins Nderitu", "Reception Officer", "Desk 5 · Maternity Wing Desk", "c.nderitu", "+254 733 003 005", "Break", 60),
    ("RECEP-106", "Halima Abdi", "Reception Officer", "Desk 6 · Imaging & Lab Front Counter", "h.abdi", "+254 733 003 006", "Offline", 1440),
    ("RECEP-107", "Ian Mwenda", "Reception Officer", "Desk 3 · Main Outpatient Lobby", "i.mwenda", "+254 733 003 007", "On-Duty", 11),
    ("RECEP-108", "Winnie Nafula", "Reception Officer", "Desk 1 · Emergency Front Counter", "w.nafula", "+254 733 003 008", "Active", 34),
    ("RECEP-109", "Abdi Hussein", "Reception Officer", "Desk 2 · Pediatric Registration", "a.hussein", "+254 733 003 009", "Offline", 4320),
    ("DOC-201", "Dr. Patrick Kariuki", "Medical Doctor", "Consultation Room 1 · General Medicine", "p.kariuki", "+254 744 004 001", "On-Duty", 20),
    ("DOC-202", "Dr. Amina Hassan", "Medical Doctor", "Consultation Room 2 · Urgent Care", "a.hassan", "+254 744 004 002", "On-Duty", 8),
    ("DOC-203", "Dr. Kennedy Omondi", "Medical Doctor", "Cardiology & Chest Clinic", "k.omondi", "+254 744 004 003", "Active", 60),
    ("DOC-204", "Dr. Jane Muthoni", "Medical Doctor", "Pediatric Medical Officer", "j.muthoni", "+254 744 004 004", "On-Duty", 35),
    ("DOC-205", "Dr. Victor Koech", "Medical Doctor", "Emergency Medicine Registrar", "v.koech", "+254 744 004 005", "On-Duty", 14),
    ("DOC-206", "Dr. Rose Nyambura", "Medical Doctor", "Obstetrics & Gynaecology", "r.nyambura", "+254 744 004 006", "Break", 180),
    ("DOC-207", "Dr. Brian Kimani", "Medical Doctor", "Internal Medicine", "b.kimani", "+254 744 004 007", "On-Duty", 27),
    ("DOC-208", "Dr. Naomi Chelimo", "Medical Doctor", "Consultation Room 3 · Family Medicine", "n.chelimo", "+254 744 004 008", "Active", 50),
    ("DOC-209", "Dr. Hassan Ali", "Medical Doctor", "Orthopaedic Clinic", "h.ali", "+254 744 004 009", "Offline", 1440),
    ("DOC-210", "Dr. Mary Wanjala", "Medical Doctor", "Psychiatry & Mental Health", "m.wanjala", "+254 744 004 010", "On-Duty", 41),
    ("KSL-301", "George Wafula", "KSL Interpreter", "Hospital Deaf Inclusion & KSL Unit", "g.wafula", "+254 755 005 001", "On-Duty", 1),
    ("KSL-302", "Susan Makena", "KSL Interpreter", "Hospital Deaf Inclusion & KSL Unit", "s.makena", "+254 755 005 002", "On-Duty", 6),
    ("KSL-303", "Dennis Kipchumba", "KSL Interpreter", "Emergency On-Call KSL Network", "d.kipchumba", "+254 755 005 003", "Active", 40),
    ("KSL-304", "Pauline Adhiambo", "KSL Interpreter", "Hospital Deaf Inclusion & KSL Unit", "p.adhiambo", "+254 755 005 004", "Offline", 1440),
    ("KSL-305", "Joseph Mutua", "KSL Interpreter", "Emergency On-Call KSL Network", "j.mutua", "+254 755 005 005", "On-Duty", 16),
    ("KSL-306", "Eunice Wangari", "KSL Interpreter", "Maternity & Pediatric KSL Desk", "e.wangari", "+254 755 005 006", "Break", 75),
    ("KSL-307", "Tom Odera", "KSL Interpreter", "Hospital Deaf Inclusion & KSL Unit", "t.odera", "+254 755 005 007", "Active", 55),
    ("SPEC-501", "Dr. Evans Muli", "Audiology Specialist", "Audiology & Speech Sciences", "e.muli", "+254 766 006 001", "Active", 50),
    ("SPEC-502", "Rachel Jerop", "Audiology Specialist", "Assistive Communication Lab", "r.jerop", "+254 766 006 002", "On-Duty", 120),
    ("SPEC-503", "Anthony Musyoka", "Audiology Specialist", "ENT Diagnostic Center", "a.musyoka", "+254 766 006 003", "Offline", 2880),
    ("SPEC-504", "Dr. Cynthia Owino", "Audiology Specialist", "Cochlear Implant Program", "c.owino", "+254 766 006 004", "On-Duty", 33),
    ("SPEC-505", "Moses Langat", "Audiology Specialist", "Hearing Aid Fitting Clinic", "m.langat", "+254 766 006 005", "Active", 85),
    ("SPEC-506", "Gladys Nyokabi", "Audiology Specialist", "Speech & Language Therapy", "g.nyokabi", "+254 766 006 006", "On-Duty", 26),
]

TERMINALS = [
    ("TERM-01", "Desk 1", "Emergency Admitting", 'iPad Pro 12.9" Reception Terminal', "Boundary mic", "NURSE-4030"),
    ("TERM-02", "Desk 2", "Pediatric Registration", "Samsung Galaxy Tab S9", "Dual array mic", "NURSE-4031"),
    ("TERM-03", "Desk 3", "Main Outpatient Lobby", 'iPad Pro 12.9" Main Kiosk', "Directional array", "NURSE-4029"),
    ("TERM-04", "Desk 4", "ENT & Audiology Desk", "Surface Pro 9", "Acoustic array", "NURSE-4032"),
    ("TERM-05", "Desk 5", "Maternity Wing Counter", 'iPad Air 11"', "Boundary mic", "NURSE-4034"),
    ("TERM-06", "Desk 6", "Specialized Diagnostics", "Samsung Galaxy Tab S9", "Directional mic", "NURSE-4035"),
]

# (id, name, symptom, symptom_sw, places, duration, urgent, minutes ago, desk, lang, status)
PATIENTS = [
    ("PT-1042", "Wanjiru Karanja", "Chest Pain", "Maumivu ya Kifua", ["Chest, left", "Throat"], "Since this morning", True, 2, "Desk 3", "Kiswahili & KSL", "Waiting"),
    ("PT-1041", "Brian Omondi", "Fever or Chills", "Homa", ["Head"], "A few days", False, 14, "Desk 2", "English", "In Triage"),
    ("PT-1040", "Faith Chebet", "Abdominal Pain", "Maumivu ya Tumbo", ["Stomach"], "More than a week", False, 28, "Desk 3", "Kiswahili", "With Doctor"),
    ("PT-1039", "Samuel Githinji", "Shortness of Breath", "Pumzi Fupi", ["Chest, right"], "Less than an hour", True, 35, "Desk 1", "Kiswahili & KSL", "With Doctor"),
    ("PT-1038", "Amina Mohamed", "Dizziness", "Kizunguzungu", ["Head"], "Since this morning", False, 42, "Desk 3", "English", "Waiting"),
    ("PT-1037", "Kelvin Mutua", "Headache", "Kuumwa na Kichwa", ["Head"], "A few days", False, 50, "Desk 4", "Kiswahili", "Waiting"),
    ("PT-1036", "Mercy Atieno", "Swelling", "Kuvimba Mwili", ["Right leg", "Left leg"], "More than a week", False, 60, "Desk 2", "KSL Assisted", "In Triage"),
    ("PT-1035", "John Kamau", "Nausea or Vomiting", "Kichefuchefu", ["Stomach"], "Since this morning", False, 65, "Desk 3", "English", "Completed"),
    ("PT-1034", "Dorcas Wanjala", "Fatigue", "Uchovu Mkubwa", ["Head", "Lower belly"], "More than a week", False, 90, "Desk 5", "Kiswahili", "Completed"),
    ("PT-1033", "Geoffrey Rotich", "Chest Pain", "Maumivu ya Kifua", ["Chest, left"], "Less than an hour", True, 120, "Desk 1", "English", "Completed"),
    ("PT-1032", "Lydia Nyaboke", "Fever or Chills", "Homa", ["Head"], "A few days", False, 125, "Desk 2", "Kiswahili & KSL", "Completed"),
    ("PT-1031", "Erick Odhiambo", "Abdominal Pain", "Maumivu ya Tumbo", ["Lower belly"], "A few days", False, 150, "Desk 3", "English", "Completed"),
    ("PT-1030", "Priscilla Mutindi", "Other Concern", "Shida Nyingine", ["Right arm"], "Since this morning", False, 180, "Desk 6", "Kiswahili", "Completed"),
    ("PT-1029", "Paul Kiptoo", "Shortness of Breath", "Pumzi Fupi", ["Chest, right"], "Less than an hour", True, 185, "Desk 1", "KSL Assisted", "Completed"),
    ("PT-1028", "Grace Makau", "Dizziness", "Kizunguzungu", ["Head"], "Since this morning", False, 210, "Desk 4", "Kiswahili", "Completed"),
    ("PT-1027", "Victor Wanyama", "Headache", "Kuumwa na Kichwa", ["Head"], "A few days", False, 240, "Desk 2", "English", "Completed"),
    ("PT-1026", "Eunice Cherono", "Swelling", "Kuvimba Mwili", ["Left arm"], "More than a week", False, 245, "Desk 3", "Kiswahili", "Completed"),
    ("PT-1025", "Bernard Maina", "Chest Pain", "Maumivu ya Kifua", ["Chest, right"], "Since this morning", True, 270, "Desk 1", "English", "Completed"),
    ("PT-1024", "Judith Auma", "Fever or Chills", "Homa", ["Head"], "A few days", False, 300, "Desk 2", "Kiswahili & KSL", "Completed"),
    ("PT-1023", "Dennis Gitau", "Abdominal Pain", "Maumivu ya Tumbo", ["Stomach"], "Since this morning", False, 330, "Desk 3", "Kiswahili", "Completed"),
    ("PT-1022", "Sharon Chepkirui", "Nausea or Vomiting", "Kichefuchefu", ["Stomach"], "Less than an hour", False, 360, "Desk 5", "English", "Completed"),
    ("PT-1021", "Moses Mwangi", "Shortness of Breath", "Pumzi Fupi", ["Throat"], "Less than an hour", True, 365, "Desk 1", "KSL Assisted", "Completed"),
    ("PT-1020", "Esther Nekesa", "Headache", "Kuumwa na Kichwa", ["Head"], "More than a week", False, 390, "Desk 4", "Kiswahili", "Completed"),
    ("PT-1019", "Stephen Ndung'u", "Other Concern", "Shida Nyingine", ["Left leg"], "A few days", False, 420, "Desk 6", "English", "Completed"),
    ("PT-1018", "Caroline Moraa", "Dizziness", "Kizunguzungu", ["Head"], "Since this morning", False, 450, "Desk 3", "Kiswahili & KSL", "Completed"),
    ("PT-1017", "Martin Musyoka", "Chest Pain", "Maumivu ya Kifua", ["Chest, left"], "Less than an hour", True, 480, "Desk 1", "English", "Completed"),
    ("PT-1016", "Ann Wambui", "Fever or Chills", "Homa", ["Head"], "A few days", False, 510, "Desk 2", "Kiswahili", "Completed"),
    ("PT-1015", "Isaac Kipchoge", "Swelling", "Kuvimba Mwili", ["Right arm"], "More than a week", False, 540, "Desk 3", "English", "Completed"),
    ("PT-1014", "Rosemary Adongo", "Abdominal Pain", "Maumivu ya Tumbo", ["Stomach"], "A few days", False, 570, "Desk 5", "Kiswahili & KSL", "Completed"),
    ("PT-1013", "Daniel Korir", "Fatigue", "Uchovu Mkubwa", ["Head"], "More than a week", False, 600, "Desk 4", "English", "Completed"),
]

INTAKE_SCRIPT = [
    "Good morning. Please tell me your name.",
    "What brings you in today?",
    "Can you show me where it hurts?",
    "How long have you felt this?",
]


def _reset_if_outdated() -> None:
    insp = inspect(engine)
    tables = set(insp.get_table_names())
    version = None
    if "schema_meta" in tables:
        with SessionLocal() as db:
            row = db.get(SchemaMeta, "version")
            version = row.value if row else None
    del insp
    engine.dispose()
    if version != SCHEMA_VERSION and tables & {"hospital_users", "triage_patients", "kiosk_terminals", "audit_logs"}:
        log.warning("Outdated ClearCaption schema detected (version=%s). Rebuilding tables.", version)
        if engine.dialect.name == "postgresql":
            from sqlalchemy import text
            with engine.begin() as conn:
                conn.execute(text(
                    "SELECT pg_terminate_backend(pid) FROM pg_stat_activity "
                    "WHERE datname = current_database() AND pid <> pg_backend_pid()"
                ))
                for tbl in ["transcript_turns", "desk_messages", "interpreter_requests", "staff_sessions", "triage_patients", "kiosk_terminals", "symptom_cards", "ksl_video_prompts", "audit_logs", "hospital_users", "schema_meta"]:
                    conn.execute(text(f'DROP TABLE IF EXISTS "{tbl}" CASCADE'))
        else:
            Base.metadata.drop_all(bind=engine)


SYMPTOM_CARDS_SEED = [
    ("SYM-01", "Chest Pain", "Maumivu ya Kifua", "heartbeat", ["chest", "heart", "tight", "pressure", "kifua", "moyo", "angina"], True, 1),
    ("SYM-02", "Shortness of Breath", "Pumzi Fupi", "wind", ["breath", "breathing", "breathe", "asthma", "dyspnea", "pumzi", "kupumua", "wheeze"], True, 2),
    ("SYM-03", "Nausea or Vomiting", "Kichefuchefu", "smiley-nervous", ["nausea", "vomit", "vomiting", "throw up", "kichefuchefu", "kutapika"], False, 3),
    ("SYM-04", "Dizziness", "Kizunguzungu", "spiral", ["dizzy", "dizziness", "faint", "vertigo", "lightheaded", "kizunguzungu"], False, 4),
    ("SYM-05", "Headache", "Kuumwa na Kichwa", "brain", ["head", "headache", "migraine", "kichwa"], False, 5),
    ("SYM-06", "Fever or Chills", "Homa", "thermometer", ["fever", "chills", "hot", "temperature", "malaria", "homa", "joto"], False, 6),
    ("SYM-07", "Abdominal Pain", "Maumivu ya Tumbo", "first-aid", ["stomach", "abdomen", "abdominal", "belly", "cramps", "tumbo", "diarrhea"], False, 7),
    ("SYM-08", "Swelling", "Kuvimba Mwili", "hand-palm", ["swelling", "swollen", "edema", "leg", "ankle", "kuvimba"], False, 8),
    ("SYM-09", "Fatigue", "Uchovu Mkubwa", "battery-low", ["fatigue", "tired", "weak", "weakness", "uchovu", "dhaifu"], False, 9),
    ("SYM-10", "Other Concern", "Shida Nyingine", "chat-circle-dots", ["other", "rash", "injury", "wound", "infection", "shida"], False, 10),
]

KSL_PROMPTS_SEED = [
    ("KSL-01", "Patient Name & Greeting", "Good morning. Please tell me your name.", "Habari za asubuhi. Tafadhali niambie jina lako.", "HELLO + NAME + WHAT + YOU", ["name", "jina", "who are you", "good morning", "hello"], 5),
    ("KSL-02", "Chief Complaint", "What brings you in today?", "Nini kimekuleta hospitalini leo?", "TODAY + HOSPITAL + PROBLEM + WHAT", ["brings you", "what is wrong", "problem", "concern", "kimekuleta", "shida"], 6),
    ("KSL-03", "Pain Location (Body Map)", "Can you show me where it hurts?", "Unaweza kunionyesha mahali panapouma?", "PAIN + WHERE + POINT + SHOW ME", ["where", "hurts", "pain", "body", "point", "wapi", "panapouma"], 5),
    ("KSL-04", "Symptom Duration", "How long has this been happening?", "Hii imekuwa ikitokea kwa muda gani?", "START + WHEN + HOW LONG", ["how long", "when did", "started", "duration", "muda gani", "lini"], 5),
    ("KSL-05", "Chest Pain Check", "Are you feeling any chest pain or tightness?", "Je, unahisi maumivu au kubana kifuani?", "CHEST + PAIN + TIGHT + YOU?", ["chest", "tight", "kifua"], 5),
    ("KSL-06", "Breathing Difficulty", "Are you having trouble breathing?", "Je, unapata shida ya kupumua?", "BREATHE + HARD + DIFFICULT?", ["breath", "breathe", "breathing", "pumzi", "kupumua"], 5),
    ("KSL-07", "Fever or Temperature", "Have you had a fever or chills recently?", "Je, umekuwa na homa au baridi hivi karibuni?", "FEVER + HOT + CHILLS + HAVE?", ["fever", "temperature", "chills", "homa", "joto"], 5),
    ("KSL-08", "Allergies Check", "Do you have any medication or food allergies?", "Je, una mzio wa dawa au chakula chochote?", "ALLERGY + MEDICINE + FOOD + ANY?", ["allergy", "allergic", "allergies", "mzio"], 6),
    ("KSL-09", "Current Medications", "Are you taking any medications right now?", "Je, unatumia dawa zozote kwa sasa?", "MEDICINE + NOW + TAKE + WHAT?", ["medication", "medicine", "pills", "tablets", "dawa"], 6),
    ("KSL-10", "Pregnancy Screening", "Is there any chance you could be pregnant?", "Je, kuna uwezekano wowote kuwa una ujauzito?", "PREGNANT + MAYBE + YOU?", ["pregnant", "pregnancy", "ujauzito", "mimba"], 5),
    ("KSL-11", "Chronic Conditions", "Do you have diabetes, asthma, or high blood pressure?", "Je, una kisukari, pumu, au shinikizo la damu?", "DIABETES + ASTHMA + BLOOD PRESSURE?", ["diabetes", "asthma", "hypertension", "blood pressure", "kisukari"], 6),
    ("KSL-12", "Pain Severity (1-10)", "How severe is your pain right now?", "Maumivu yako ni makali kiasi gani kwa sasa?", "PAIN + LEVEL + SMALL OR BIG?", ["severe", "severity", "scale", "how bad", "makali"], 5),
    ("KSL-13", "National ID / SHIF Card", "Please show your National ID or SHIF card.", "Tafadhali onyesha Kitambulisho chako au kadi ya SHIF.", "ID CARD + SHIF + SHOW PLEASE", ["id", "shif", "nhif", "card", "kitambulisho"], 5),
    ("KSL-14", "Vital Signs — Blood Pressure", "I am going to check your blood pressure and temperature.", "Nitapima shinikizo la damu na joto lako.", "CHECK + BLOOD PRESSURE + TEMPERATURE", ["vital", "vitals", "blood pressure", "check your"], 6),
    ("KSL-15", "Waiting Bay Guidance", "Please have a seat in the waiting bay.", "Tafadhali kaa kwenye eneo la kusubiri.", "PLEASE + SIT + WAIT + BAY", ["seat", "sit", "wait", "bay", "kusubiri"], 5),
    ("KSL-16", "Doctor Reviewing Chart", "The doctor is reviewing your chart and will see you soon.", "Daktari anakagua taarifa zako na atakuona hivi karibuni.", "DOCTOR + READ + YOUR FILE + SOON", ["doctor", "chart", "reviewing", "daktari"], 6),
    ("KSL-17", "Interpreter Dispatched", "A KSL interpreter is on the way to this desk.", "Mkalimani wa Lugha ya Alama anakuja hapa sasa.", "KSL INTERPRETER + COMING + NOW", ["interpreter", "mkalimani", "sign language"], 5),
    ("KSL-18", "Pharmacy / Prescription", "Please take this prescription to the pharmacy.", "Tafadhali peleka cheti hiki cha dawa kwenye duka la dawa.", "PAPER + MEDICINE + GO PHARMACY", ["pharmacy", "prescription", "duka la dawa"], 5),
    ("KSL-19", "Lab / Blood Test", "You need to go to the laboratory for a blood test.", "Unahitaji kwenda maabara kwa kipimo cha damu.", "GO + LAB + BLOOD + TEST", ["lab", "laboratory", "blood test", "maabara"], 6),
    ("KSL-20", "Session Complete / Handoff", "Thank you. Your summary is ready for the triage nurse.", "Asante. Muhtasari wako uko tayari kwa muuguzi wa triage.", "THANK YOU + FINISH + SUMMARY READY", ["thank you", "summary", "finished", "complete", "asante"], 5),
]


def _seed(db: Session) -> None:
    now = utcnow()
    users: dict[str, HospitalUser] = {}
    for i, (badge, name, role, dept, email, phone, status, mins) in enumerate(USERS, start=1):
        u = HospitalUser(
            id=f"USR-{i:02d}",
            badge_id=badge,
            name=name,
            role=role,
            department=dept,
            email=f"{email}@knh.or.ke",
            phone=phone,
            status=status,
            pin_hash=hash_pin(ROLE_PINS.get(role, DEFAULT_PIN)),
            last_login_at=now - timedelta(minutes=mins) if mins is not None else None,
            created_at=now - timedelta(days=120 - i),
        )
        users[badge] = u
        db.add(u)
    db.flush()

    terminals: dict[str, KioskTerminal] = {}
    for tid, desk, location, device, mic, nurse_badge in TERMINALS:
        t = KioskTerminal(
            id=tid,
            desk=desk,
            location=location,
            device_type=device,
            microphone=mic,
            assigned_user_id=users[nurse_badge].id,
        )
        terminals[desk] = t
        db.add(t)
    db.flush()

    for pid, name, sym, sym_sw, places, duration, urgent, mins, desk, lang, status in PATIENTS:
        created = now - timedelta(minutes=mins)
        p = TriagePatient(
            id=pid,
            name=name,
            symptom=sym,
            symptom_sw=sym_sw,
            places=json.dumps(places),
            duration=duration,
            urgent=urgent,
            desk=desk,
            terminal_id=terminals[desk].id,
            lang=lang,
            status=status,
            assigned_to_id=terminals[desk].assigned_user_id,
            created_at=created,
            updated_at=created,
        )
        db.add(p)
        answers = [("keypad", name), ("card", f"{sym} · {sym_sw}"), ("body-map", ", ".join(places)), ("chips", duration)]
        for step, (question, (channel, answer)) in enumerate(zip(INTAKE_SCRIPT, answers)):
            at = created + timedelta(seconds=step * 40)
            db.add(TranscriptTurn(patient_id=pid, speaker="nurse", channel="spoken", text=question, created_at=at))
            db.add(TranscriptTurn(patient_id=pid, speaker="patient", channel=channel, text=answer, created_at=at + timedelta(seconds=15)))

    for cid, en, sw, icon_key, kw, urgent, order in SYMPTOM_CARDS_SEED:
        db.add(
            SymptomCard(
                id=cid,
                en=en,
                sw=sw,
                icon_key=icon_key,
                keywords=json.dumps(kw),
                urgent=urgent,
                is_active=True,
                sort_order=order,
            )
        )

    for order, (kid, title, q_en, q_sw, gloss, kw, dur) in enumerate(KSL_PROMPTS_SEED, start=1):
        db.add(
            KslVideoPrompt(
                id=kid,
                title=title,
                question_en=q_en,
                question_sw=q_sw,
                ksl_gloss=gloss,
                trigger_keywords=json.dumps(kw),
                video_url=f"builtin://{kid.lower()}",
                duration_sec=dur,
                is_active=True,
                sort_order=order,
            )
        )

    db.add_all(
        [
            AuditLog(event_type="SYSTEM_SEEDED", details="Database initialised with 50 staff accounts, 6 kiosks, 30 triage records, 10 symptom cards and 20 KSL prompts.", created_at=now),
        ]
    )
    db.merge(SchemaMeta(key="version", value=SCHEMA_VERSION))


def init_database() -> None:
    _reset_if_outdated()
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        if db.query(HospitalUser).count() == 0:
            log.info("Seeding ClearCaption database")
            _seed(db)
            db.commit()
        elif db.get(SchemaMeta, "version") is None:
            db.merge(SchemaMeta(key="version", value=SCHEMA_VERSION))
            db.commit()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    init_database()
    print("Database ready.")

