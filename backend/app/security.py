import hashlib
import hmac
import secrets

import bcrypt

_LEGACY_ITERATIONS = 120_000


def hash_pin(pin: str) -> str:
    """Hash a clinician PIN or admin password using bcrypt (Report §4.1.2 NFR4)."""
    return bcrypt.hashpw(pin.encode("utf-8"), bcrypt.gensalt(rounds=10)).decode("utf-8")


def verify_pin(pin: str, stored: str) -> bool:
    """Verify a PIN against a bcrypt hash (with legacy PBKDF2 fallback)."""
    if stored.startswith("$2"):
        try:
            return bcrypt.checkpw(pin.encode("utf-8"), stored.encode("utf-8"))
        except ValueError:
            return False
    try:
        salt, digest = stored.split("$", 1)
    except ValueError:
        return False
    candidate = hashlib.pbkdf2_hmac("sha256", pin.encode(), bytes.fromhex(salt), _LEGACY_ITERATIONS).hex()
    return hmac.compare_digest(candidate, digest)


def new_token() -> str:
    return secrets.token_urlsafe(48)


def random_pin() -> str:
    return f"{secrets.randbelow(10_000):04d}"
