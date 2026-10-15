"""Authentication endpoints (JWT stored in an httpOnly cookie)."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Response, status

from app.core.config import settings
from app.core.deps import CurrentUser, DbSession, clear_auth_cookie, set_auth_cookie
from app.core.security import create_access_token, verify_password
from app.crud.user import user_crud
from app.models.user import ROLE_USER
from app.schemas.common import Message
from app.schemas.user import AuthResponse, LoginRequest, RegisterRequest, UserRead

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, response: Response, db: DbSession) -> AuthResponse:
    user = user_crud.get_by_email(db, payload.email)
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled")

    token = create_access_token(subject=user.id or 0, role=user.role)
    set_auth_cookie(response, token)
    return AuthResponse(user=UserRead.model_validate(user))


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, response: Response, db: DbSession) -> AuthResponse:
    if not settings.enable_user_auth:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User registration is disabled",
        )
    if user_crud.get_by_email(db, payload.email) is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = user_crud.create_user(
        db,
        email=payload.email,
        password=payload.password,
        full_name=payload.full_name,
        role=ROLE_USER,
    )
    token = create_access_token(subject=user.id or 0, role=user.role)
    set_auth_cookie(response, token)
    return AuthResponse(user=UserRead.model_validate(user))


@router.post("/logout", response_model=Message)
def logout(response: Response) -> Message:
    clear_auth_cookie(response)
    return Message(detail="Logged out")


@router.get("/me", response_model=UserRead)
def me(user: CurrentUser) -> UserRead:
    return UserRead.model_validate(user)
