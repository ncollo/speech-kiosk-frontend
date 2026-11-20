def test_health(client):
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json()["database"]["connected"] is True


def test_login_rules(client):
    assert client.post("/api/auth/login", json={"badge_id": "NURSE-4029", "pin": "0000"}).status_code == 401
    assert client.post("/api/auth/login", json={"badge_id": "NOPE-1", "pin": "1234"}).status_code == 401
    r = client.post("/api/auth/login", json={"badge_id": "admin-001", "pin": "9900"})
    assert r.status_code == 200 and r.json()["portal"] == "admin"
    r = client.post("/api/auth/login", json={"badge_id": "DOC-201", "pin": "1234"})
    assert r.status_code == 200 and r.json()["portal"] == "staff"


def test_protected_routes_require_login(client):
    for path in ["/api/users", "/api/patients", "/api/terminals", "/api/audit/logs", "/api/stats"]:
        assert client.get(path).status_code == 401


def test_fifty_staff(client, admin):
    users = client.get("/api/users", headers=admin).json()
    assert len(users) == 50
    assert {u["role"] for u in users} >= {"Hospital Administrator", "Triage Nurse", "Medical Doctor"}
    assert len(client.get("/api/users?role=Triage Nurse", headers=admin).json()) == 14


def test_admin_user_management(client, admin, nurse):
    body = {"name": "Nurse Test Person", "role": "Triage Nurse", "department": "Desk 2 · Pediatric Reception", "pin": "5555"}
    assert client.post("/api/users", json=body, headers=nurse).status_code == 403
    r = client.post("/api/users", json=body, headers=admin)
    assert r.status_code == 201
    created = r.json()["user"]
    assert created["badgeId"].startswith("NURSE-")
    # the new user can sign in with the chosen PIN
    login = client.post("/api/auth/login", json={"badge_id": created["badgeId"], "pin": "5555"})
    assert login.status_code == 200
    # deactivate -> can no longer sign in
    assert client.patch(f"/api/users/{created['id']}", json={"is_active": False}, headers=admin).status_code == 200
    assert client.post("/api/auth/login", json={"badge_id": created["badgeId"], "pin": "5555"}).status_code == 403
    # reset pin returns a new 4 digit pin
    pin = client.post(f"/api/users/{created['id']}/reset-pin", headers=admin).json()["pin"]
    assert len(pin) == 4 and pin.isdigit()


def test_full_kiosk_to_console_flow(client, nurse):
    terminals = client.get("/api/kiosk/terminals").json()
    assert len(terminals) == 6
    cursor = client.get("/api/kiosk/TERM-03/poll?after=-1").json()["latestId"]

    p = client.post("/api/kiosk/TERM-03/intakes", json={"lang": "English"}).json()
    pid = p["id"]
    assert p["status"] == "Checking In"
    client.post(f"/api/kiosk/intakes/{pid}/turns", json={"speaker": "nurse", "channel": "spoken", "text": "Please tell me your name."})
    client.post(f"/api/kiosk/intakes/{pid}/turns", json={"speaker": "patient", "channel": "keypad", "text": "Amos Test"})
    client.patch(f"/api/kiosk/intakes/{pid}", json={"name": "Amos Test"})
    client.patch(f"/api/kiosk/intakes/{pid}", json={"symptom": "Chest Pain", "symptom_sw": "Maumivu ya Kifua", "urgent": True})
    client.patch(f"/api/kiosk/intakes/{pid}", json={"places": ["Chest, left"]})
    done = client.patch(f"/api/kiosk/intakes/{pid}", json={"duration": "Less than an hour", "complete": True}).json()
    assert done["status"] == "Waiting" and done["urgent"] is True

    # nurse console sees it, with transcript
    queue = client.get("/api/patients?active=true", headers=nurse).json()
    assert queue[0]["id"] == pid
    detail = client.get(f"/api/patients/{pid}", headers=nurse).json()
    assert [t["text"] for t in detail["transcript"]][:2] == ["Please tell me your name.", "Amos Test"]

    # nurse sends a message -> kiosk receives it
    sent = client.post("/api/terminals/TERM-03/messages", json={"text": "Please have a seat in Bay 3", "patient_id": pid}, headers=nurse)
    assert sent.status_code == 201
    polled = client.get(f"/api/kiosk/TERM-03/poll?after={cursor}&patient_id={pid}").json()
    assert polled["messages"][-1]["text"] == "Please have a seat in Bay 3"

    # kiosk requests interpreter -> nurse dispatches -> kiosk sees status
    req = client.post("/api/kiosk/TERM-03/interpreter", json={"patient_id": pid}).json()
    assert any(r["id"] == req["id"] for r in client.get("/api/interpreter-requests", headers=nurse).json())
    client.patch(f"/api/interpreter-requests/{req['id']}", json={"status": "Dispatched"}, headers=nurse)
    polled = client.get(f"/api/kiosk/TERM-03/poll?after={cursor}&patient_id={pid}").json()
    assert polled["interpreter"]["status"] == "Dispatched"

    # status change
    r = client.patch(f"/api/patients/{pid}/status", json={"status": "In Triage"}, headers=nurse)
    assert r.json()["status"] == "In Triage"

    # terminal shows online after heartbeat
    term3 = next(t for t in client.get("/api/terminals", headers=nurse).json() if t["id"] == "TERM-03")
    assert term3["online"] is True

    # audit trail recorded everything
    events = {a["eventType"] for a in client.get("/api/audit/logs", headers=nurse).json()}
    assert {"INTAKE_STARTED", "INTAKE_COMPLETED", "DESK_MESSAGE", "INTERPRETER_REQUESTED", "INTERPRETER_DISPATCHED", "PATIENT_STATUS"} <= events


def test_abandoned_intake_is_wiped(client, nurse):
    pid = client.post("/api/kiosk/TERM-01/intakes", json={}).json()["id"]
    client.post("/api/kiosk/TERM-01/wipe", json={"patient_id": pid})
    assert client.get(f"/api/patients/{pid}", headers=nurse).status_code == 404


def test_stats(client, admin):
    s = client.get("/api/stats", headers=admin).json()
    assert s["staffTotal"] >= 50 and s["kiosksTotal"] == 6



def test_bcrypt_pin_hashing():
    from app.security import hash_pin, verify_pin

    hashed = hash_pin("4821")
    assert hashed.startswith("$2")
    assert verify_pin("4821", hashed) is True
    assert verify_pin("0000", hashed) is False


def test_catalog_symptom_cards_ksl_and_matching(client, admin, nurse):
    cards = client.get("/api/catalog/symptom-cards").json()["items"]
    assert len(cards) >= 10
    prompts = client.get("/api/catalog/ksl-prompts").json()["items"]
    assert len(prompts) >= 20

    # Nurse cannot create symptom cards (RBAC)
    assert client.post("/api/catalog/symptom-cards", json={"en": "Rash", "sw": "Upele", "keywords": ["rash"]}, headers=nurse).status_code == 403

    # Admin creates, updates, and deletes a symptom card
    created = client.post(
        "/api/catalog/symptom-cards",
        json={"en": "Blurred Vision", "sw": "Ukungu Machoni", "icon_key": "spiral", "keywords": ["vision", "blurry", "ukweli"], "urgent": False},
        headers=admin,
    )
    assert created.status_code == 201, created.text
    cid = created.json()["id"]

    patched = client.patch(f"/api/catalog/symptom-cards/{cid}", json={"is_active": False}, headers=admin)
    assert patched.status_code == 200 and patched.json()["isActive"] is False

    # Keyword matching matches active chest pain card & KSL prompt
    match = client.post("/api/catalog/match", json={"text": "Are you feeling chest pain or shortness of breath?"}).json()
    matched_en = {c["en"] for c in match["matchedCards"]}
    assert "Chest Pain" in matched_en
    assert match["matchedKslPrompt"] is not None

    # Admin creates KSL prompt and uploads a video file
    ksl = client.post(
        "/api/catalog/ksl-prompts",
        json={
            "title": "Test Triage Prompt",
            "question_en": "Do you have blurred vision?",
            "question_sw": "Je, unaona ukungu?",
            "trigger_keywords": ["blurred", "vision"],
        },
        headers=admin,
    )
    assert ksl.status_code == 201, ksl.text
    kid = ksl.json()["id"]
    up = client.post(
        f"/api/catalog/ksl-prompts/{kid}/upload",
        files={"file": ("sample.webm", b"WEBM_TEST_BYTES", "video/webm")},
        headers=admin,
    )
    assert up.status_code == 200, up.text
    video_url = up.json()["videoUrl"]
    assert video_url.startswith("/api/catalog/ksl-media/")
    assert client.get(video_url).status_code == 200

    assert client.delete(f"/api/catalog/symptom-cards/{cid}", headers=admin).status_code == 200
    assert client.delete(f"/api/catalog/ksl-prompts/{kid}", headers=admin).status_code == 200


def test_clinician_asr_edit_repeat_and_consent_purge(client, nurse):
    # 1. Start session with consent declined -> end_session must purge immediately
    ephemeral_id = client.post("/api/kiosk/TERM-02/intakes", json={"lang": "English & KSL", "consent_given": False}).json()["id"]
    t_res = client.post(
        f"/api/patients/{ephemeral_id}/turns",
        json={"text": "Patient reports disnear", "confidence": 0.61, "is_uncertain": True},
        headers=nurse,
    )
    assert t_res.status_code == 201
    turn_id = t_res.json()["id"]
    assert t_res.json()["isUncertain"] is True

    # Clinician edits misrecognized medical term inline
    edit_res = client.patch(
        f"/api/patients/{ephemeral_id}/turns/{turn_id}",
        json={"text": "Patient reports dyspnea"},
        headers=nurse,
    )
    assert edit_res.status_code == 200
    assert edit_res.json()["text"] == "Patient reports dyspnea"
    assert edit_res.json()["originalText"] == "Patient reports disnear"
    assert edit_res.json()["isUncertain"] is False

    # Repeat last caption
    rep = client.post(f"/api/patients/{ephemeral_id}/repeat-caption", headers=nurse)
    assert rep.status_code == 200
    assert rep.json()["text"] == "Patient reports dyspnea"

    # End session with declined consent -> purged!
    end_res = client.post(f"/api/patients/{ephemeral_id}/end-session", json={}, headers=nurse)
    assert end_res.status_code == 200
    assert end_res.json()["purged"] is True
    assert client.get(f"/api/patients/{ephemeral_id}", headers=nurse).status_code == 404

    # 2. Start session with consent accepted -> end_session retains summary
    consented_id = client.post("/api/kiosk/TERM-02/intakes", json={"lang": "English & KSL", "consent_given": True}).json()["id"]
    end_ok = client.post(f"/api/patients/{consented_id}/end-session", json={"summary_notes": "Vitals stable"}, headers=nurse)
    assert end_ok.status_code == 200
    assert end_ok.json()["purged"] is False
    assert end_ok.json()["patient"]["status"] == "Waiting"


def test_websocket_terminal_relay(client):
    with client.websocket_connect("/api/ws/terminal/TERM-03") as ws1:
        with client.websocket_connect("/api/ws/terminal/TERM-03") as ws2:
            ws1.send_json({"type": "live_caption", "text": "Can you show me where it hurts?", "interim": False})
            received = ws2.receive_json()
            assert received["type"] == "live_caption"
            assert received["text"] == "Can you show me where it hurts?"


def test_patient_disposition_discharge_and_admission(client, nurse):
    # Path A: Walk-in -> Triage -> Prescription -> Pharmacy -> Discharged with Medicine
    p1 = client.post("/api/kiosk/TERM-03/intakes", json={"lang": "English & KSL", "consent_given": True}).json()["id"]
    client.patch(f"/api/kiosk/intakes/{p1}", json={"name": "Amina Hassan", "symptom": "Fever or Chills", "symptom_sw": "Homa", "places": ["Head"], "duration": "Since this morning", "complete": True})
    rx = client.post(
        f"/api/patients/{p1}/disposition",
        json={"action": "pharmacy", "diagnosis": "Acute Viral Fever", "prescription": "Paracetamol 500mg TDS x 5 days"},
        headers=nurse,
    )
    assert rx.status_code == 200 and rx.json()["status"] == "Pharmacy"

    dis = client.post(
        f"/api/patients/{p1}/disposition",
        json={"action": "discharged", "prescription": "Paracetamol 500mg TDS x 5 days"},
        headers=nurse,
    )
    assert dis.status_code == 200
    assert dis.json()["status"] == "Discharged"
    assert dis.json()["disposition"] == "Discharged with Medication"

    # Path B: Urgent Walk-in -> Admitted to Ward
    p2 = client.post("/api/kiosk/TERM-01/intakes", json={"lang": "English & KSL", "consent_given": True}).json()["id"]
    client.patch(f"/api/kiosk/intakes/{p2}", json={"name": "David Kamau", "symptom": "Chest Pain", "symptom_sw": "Maumivu ya Kifua", "places": ["Chest, left"], "duration": "Less than an hour", "urgent": True, "complete": True})
    adm = client.post(
        f"/api/patients/{p2}/disposition",
        json={"action": "admitted", "diagnosis": "Suspected Acute Coronary Syndrome", "prescription": "Aspirin 300mg STAT + ECG monitoring", "ward": "Cardiac Observation Ward B · Bed 4"},
        headers=nurse,
    )
    assert adm.status_code == 200
    assert adm.json()["status"] == "Admitted"
    assert adm.json()["ward"] == "Cardiac Observation Ward B · Bed 4"
