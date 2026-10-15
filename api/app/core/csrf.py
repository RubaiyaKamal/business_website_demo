"""CSRF protection using the double-submit cookie pattern.

A random token is stored in a readable cookie (``csrf_cookie_name``). Cookie
authenticated clients must echo it back in the ``csrf_header_name`` header on
every state-changing request. Because only same-site JavaScript can read the
cookie, a cross-site attacker cannot forge the matching header.
"""

from __future__ import annotations

import secrets

from fastapi import HTTPException, Request, Response, status

from app.core.config import settings

SAFE_METHODS = frozenset({"GET", "HEAD", "OPTIONS", "TRACE"})


def generate_csrf_token() -> str:
    """Create a cryptographically-random CSRF token."""
    return secrets.token_urlsafe(32)


def set_csrf_cookie(response: Response, token: str | None = None) -> str:
    """Attach the CSRF token as a readable (non-httpOnly) cookie."""
    value = token or generate_csrf_token()
    response.set_cookie(
        key=settings.csrf_cookie_name,
        value=value,
        httponly=False,
        secure=settings.cookie_secure,
        samesite="lax",
        domain=settings.cookie_domain or None,
        path="/",
    )
    return value


def require_csrf(request: Request) -> None:
    """Reject unsafe requests whose header does not match the CSRF cookie."""
    if request.method in SAFE_METHODS:
        return
    cookie = request.cookies.get(settings.csrf_cookie_name)
    header = request.headers.get(settings.csrf_header_name)
    if not cookie or not header or not secrets.compare_digest(cookie, header):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="CSRF token missing or invalid",
        )
