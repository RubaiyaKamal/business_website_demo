"""Password hashing and JWT helpers."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta
from typing import Any

import bcrypt
import jwt

from app.core.config import settings

# bcrypt only considers the first 72 bytes of a password.
_BCRYPT_MAX_BYTES = 72


def _prepare(password: str) -> bytes:
    return password.encode("utf-8")[:_BCRYPT_MAX_BYTES]


def hash_password(password: str) -> str:
    """Hash a plaintext password with bcrypt."""
    return bcrypt.hashpw(_prepare(password), bcrypt.gensalt(rounds=settings.bcrypt_rounds)).decode(
        "utf-8"
    )


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Constant-time verification of a password against its bcrypt hash."""
    try:
        return bcrypt.checkpw(_prepare(plain_password), hashed_password.encode("utf-8"))
    except ValueError:
        return False


def create_access_token(
    *,
    subject: str | int,
    role: str,
    expires_minutes: int | None = None,
) -> str:
    """Create a signed JWT access token."""
    now = datetime.now(UTC)
    expire = now + timedelta(minutes=expires_minutes or settings.access_token_expire_minutes)
    payload: dict[str, Any] = {
        "sub": str(subject),
        "role": role,
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
    }
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def decode_access_token(token: str) -> dict[str, Any] | None:
    """Decode and validate a JWT, returning its claims or None if invalid."""
    try:
        claims: dict[str, Any] = jwt.decode(
            token, settings.secret_key, algorithms=[settings.algorithm]
        )
    except jwt.PyJWTError:
        return None
    return claims
