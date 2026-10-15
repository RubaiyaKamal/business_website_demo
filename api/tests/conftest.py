"""Pytest fixtures: in-memory SQLite database and authenticated clients."""

from __future__ import annotations

from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool
from sqlmodel import SQLModel

import app.models  # noqa: F401  (registers tables on SQLModel.metadata)
from app.db import get_session
from app.main import app

ADMIN_EMAIL = "admin@greenvolt.com"
ADMIN_PASSWORD = "AdminPass123!"


@pytest.fixture(autouse=True)
def _disable_rate_limit(monkeypatch: pytest.MonkeyPatch) -> None:
    """Keep the shared limiter out of the way unless a test opts back in."""
    from app.core.rate_limit import limiter

    monkeypatch.setattr(limiter, "enabled", False)


@pytest.fixture()
def engine() -> Iterator[object]:
    """A fresh in-memory SQLite database shared across connections."""
    test_engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(test_engine)
    yield test_engine
    SQLModel.metadata.drop_all(test_engine)
    test_engine.dispose()


@pytest.fixture()
def db_session(engine: object) -> Iterator[Session]:
    with Session(engine) as session:  # type: ignore[arg-type]
        yield session


@pytest.fixture()
def client(engine: object) -> Iterator[TestClient]:
    def override_get_session() -> Iterator[Session]:
        with Session(engine) as session:  # type: ignore[arg-type]
            yield session

    app.dependency_overrides[get_session] = override_get_session
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture()
def admin_client(client: TestClient, db_session: Session) -> TestClient:
    """A client authenticated as an admin, with cookies applied."""
    from app.crud.user import user_crud

    user_crud.create_user(
        db_session,
        email=ADMIN_EMAIL,
        password=ADMIN_PASSWORD,
        full_name="Test Admin",
        role="admin",
    )
    response = client.post(
        "/api/v1/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
    )
    assert response.status_code == 200, response.text
    # Logging in also issues the CSRF cookie; echo it on later admin writes.
    csrf_token = client.cookies.get("gv_csrf")
    assert csrf_token, "login should set a CSRF cookie"
    client.headers["x-csrf-token"] = csrf_token
    return client
