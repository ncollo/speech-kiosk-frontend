from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=BASE_DIR / ".env", extra="ignore")

    APP_NAME: str = "ClearCaption Hospital Kiosk API"
    APP_VERSION: str = "2.0.0"
    ENVIRONMENT: str = "development"

    # PostgreSQL is the primary database. If it cannot be reached and the
    # fallback is enabled, a local SQLite file is used so the system still runs.
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/clearcaption_db"
    USE_SQLITE_FALLBACK: bool = True

    # Staff session lifetime
    SESSION_HOURS: int = 12

    # A kiosk is considered online if it sent a heartbeat within this window
    KIOSK_ONLINE_SECONDS: int = 60

    # Comma separated list of allowed browser origins
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173"

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


settings = Settings()

