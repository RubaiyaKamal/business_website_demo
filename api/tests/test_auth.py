"""Auth flow tests: login, me, logout, registration flag, admin guard."""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.core.config import settings
from app.crud.user import user_crud

from .conftest import ADMIN_EMAIL


def test_me_requires_auth(client) -> None:
    assert client.get("/api/v1/auth/me").status_code == 401


def test_login_me_logout_flow(admin_client) -> None:
    me = admin_client.get("/api/v1/auth/me")
    assert me.status_code == 200
    body = me.json()
    assert body["email"] == ADMIN_EMAIL
    assert body["role"] == "admin"

    assert admin_client.post("/api/v1/auth/logout").status_code == 200
    assert admin_client.get("/api/v1/auth/me").status_code == 401


def test_login_wrong_password(client, db_session: Session) -> None:
    user_crud.create_user(
        db_session,
        email="user@greenvolt.com",
        password="CorrectPass1",
        full_name="Some User",
    )
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "user@greenvolt.com", "password": "WrongPass1"},
    )
    assert response.status_code == 401


def test_register_disabled_by_default(client) -> None:
    response = client.post(
        "/api/v1/auth/register",
        json={"email": "new@greenvolt.com", "full_name": "New User", "password": "Secret123"},
    )
    assert response.status_code == 403


def test_register_enabled_creates_user(client, monkeypatch) -> None:
    monkeypatch.setattr(settings, "enable_user_auth", True)
    payload = {"email": "new@greenvolt.com", "full_name": "New User", "password": "Secret123"}
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201, response.text
    assert response.json()["user"]["role"] == "user"

    duplicate = client.post("/api/v1/auth/register", json=payload)
    assert duplicate.status_code == 409


def test_non_admin_cannot_access_admin(client, db_session: Session) -> None:
    user_crud.create_user(
        db_session,
        email="plain@greenvolt.com",
        password="PlainPass1",
        full_name="Plain User",
        role="user",
    )
    login = client.post(
        "/api/v1/auth/login",
        json={"email": "plain@greenvolt.com", "password": "PlainPass1"},
    )
    assert login.status_code == 200
    assert client.get("/api/v1/admin/services").status_code == 403


def test_admin_guard_blocks_anonymous(client) -> None:
    assert client.get("/api/v1/admin/stats").status_code == 401
    assert client.get("/api/v1/admin/services").status_code == 401
