"""WebSocket endpoint for real-time clinician <-> patient kiosk caption & state sync."""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.db import SessionLocal, utcnow
from app.models import KioskTerminal
from app.ws import hub

router = APIRouter(tags=["WebSocket"])


@router.websocket("/api/ws/terminal/{terminal_id}")
async def terminal_ws(ws: WebSocket, terminal_id: str):
    await hub.connect(terminal_id, ws)
    try:
        while True:
            data = await ws.receive_json()
            if not isinstance(data, dict):
                continue
            event_type = data.get("type")
            if event_type == "ping":
                await ws.send_json({"type": "pong", "ts": data.get("ts")})
                continue
            if event_type == "mic_status":
                status = str(data.get("status", "ready"))[:24]
                with SessionLocal() as db:
                    t = db.get(KioskTerminal, terminal_id)
                    if t:
                        t.mic_status = status
                        t.last_heartbeat_at = utcnow()
                        db.commit()
            # Relay live captions, mic_status, repeat_caption, etc. to the paired display
            await hub.broadcast(terminal_id, data, exclude=ws)
    except WebSocketDisconnect:
        hub.disconnect(terminal_id, ws)
    except Exception:
        hub.disconnect(terminal_id, ws)

