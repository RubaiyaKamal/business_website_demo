"""Reusable FastAPI dependencies: DB session, current user, admin guard."""

from __future__ import annotations

from typing import Annotated

from fastapi import Cookie, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import decode_access_token
from app.db import get_session
from app.models.user import User

SessionDep = Annotated[Session, Depends(get_session)]


def _resolve_user(token: str | None, db: Session) -> User | None:
    if not token:
        return None
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        return None
    try:
        user_id = int(payload["sub"])
    except (TypeError, ValueError):
        return None
    return db.get(User, user_id)


def get_current_user(
    db: SessionDep,
    access_token: Annotated[str | None, Cookie(alias=settings.session_cookie_name)] = None,
) -> User:
    """Require an authenticated, active user (via the httpOnly cookie)."""
    user = _resolve_user(access_token, db)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled")
    return user


def get_optional_user(
    db: SessionDep,
    access_token: Annotated[str | None, Cookie(alias=settings.session_cookie_name)] = None,
) -> User | None:
    """Return the current user if authenticated, otherwise None."""
    return _resolve_user(access_token, db)


def require_admin(
    user: Annotated[User, Depends(get_current_user)],
) -> User:
    """Require the authenticated user to have the admin role."""
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator access required",
        )
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]
OptionalUser = Annotated[User | None, Depends(get_optional_user)]
AdminUser = Annotated[User, Depends(require_admin)]
DbSession = Annotated[Session, Depends(get_session)]


def set_auth_cookie(response: Response, token: str) -> None:
    """Attach the JWT as an httpOnly cookie."""
    response.set_cookie(
        key=settings.session_cookie_name,
        value=token,
        max_age=settings.access_token_expire_minutes * 60,
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
        domain=settings.cookie_domain or None,
        path="/",
    )


def clear_auth_cookie(response: Response) -> None:
    response.delete_cookie(
        key=settings.session_cookie_name,
        domain=settings.cookie_domain or None,
        path="/",
    )


def get_client_ip(request: Request) -> str | None:
    """Best-effort client IP, honouring a reverse proxy's X-Forwarded-For."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else None
