import logging
from datetime import datetime, timezone

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import BASE_DIR, settings

log = logging.getLogger("clearcaption.db")


class Base(DeclarativeBase):
    pass


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def as_utc(dt: datetime | None) -> datetime | None:
    """SQLite returns naive datetimes; treat them as UTC."""
    if dt is None:
        return None
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)


def iso(dt: datetime | None) -> str | None:
    dt = as_utc(dt)
    return dt.isoformat().replace("+00:00", "Z") if dt else None


def _make_engine():
    url = settings.DATABASE_URL
    if url.startswith("postgresql"):
        try:
            eng = create_engine(
                url,
                pool_pre_ping=True,
                pool_size=10,
                max_overflow=20,
                connect_args={"connect_timeout": 3},
            )
            with eng.connect():
                pass
            log.info("Connected to PostgreSQL")
            return eng
        except Exception as exc:  # pragma: no cover - depends on local setup
            if not settings.USE_SQLITE_FALLBACK:
                raise
            log.warning("PostgreSQL unavailable (%s). Falling back to SQLite.", exc)
            url = f"sqlite:///{BASE_DIR / 'clearcaption.db'}"
    kwargs = {"connect_args": {"check_same_thread": False}} if url.startswith("sqlite") else {}
    return create_engine(url, **kwargs)


engine = _make_engine()
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

