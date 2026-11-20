"""In-memory WebSocket hub for low-latency (<500ms) dual-display synchronization."""

import asyncio
import logging
from collections import defaultdict

from fastapi import WebSocket

log = logging.getLogger("clearcaption.ws")


class TerminalHub:
    def __init__(self) -> None:
        self._connections: dict[str, set[WebSocket]] = defaultdict(set)
        self._loop: asyncio.AbstractEventLoop | None = None

    def set_loop(self, loop: asyncio.AbstractEventLoop) -> None:
        self._loop = loop

    async def connect(self, terminal_id: str, ws: WebSocket) -> None:
        await ws.accept()
        self._loop = asyncio.get_running_loop()
        self._connections[terminal_id].add(ws)

    def disconnect(self, terminal_id: str, ws: WebSocket) -> None:
        conns = self._connections.get(terminal_id)
        if conns and ws in conns:
            conns.discard(ws)

    async def broadcast(self, terminal_id: str, event: dict, exclude: WebSocket | None = None) -> None:
        conns = list(self._connections.get(terminal_id, ()))
        if not conns:
            return
        dead: list[WebSocket] = []
        for ws in conns:
            if ws is exclude:
                continue
            try:
                await ws.send_json(event)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(terminal_id, ws)

    def broadcast_sync(self, terminal_id: str, event: dict) -> None:
        """Schedule a broadcast from synchronous FastAPI route handlers."""
        if not self._loop or self._loop.is_closed():
            return
        if not self._connections.get(terminal_id):
            return
        try:
            asyncio.run_coroutine_threadsafe(self.broadcast(terminal_id, event), self._loop)
        except Exception as exc:
            log.debug("WebSocket broadcast_sync skipped: %s", exc)


hub = TerminalHub()

