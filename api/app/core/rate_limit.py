"""In-process rate limiting (slowapi), keyed by client IP.

The limiter is disabled when ``rate_limit_enabled`` is false, which keeps tests
and local development predictable. Limits are configured per-endpoint via the
``rate_limit`` / ``login_rate_limit`` settings.
"""

from __future__ import annotations

from fastapi import Request
from slowapi import Limiter

from app.core.config import settings


def client_key(request: Request) -> str:
    """Rate-limit bucket key: the client IP, honouring a reverse proxy."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip() or "unknown"
    return request.client.host if request.client else "unknown"


limiter = Limiter(key_func=client_key, enabled=settings.rate_limit_enabled)
