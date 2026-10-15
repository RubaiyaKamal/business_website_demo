"""Security hardening: headers, cookies, CSRF and rate limiting."""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.core.config import settings
from app.crud.user import user_crud

INQUIRY = {
    "name": "Fatima",
    "email": "fatima@greenvolt.com",
    "subject": "Repair",
    "message": "My laptop screen is cracked please advise.",
}

TESTIMONIAL = {"name": "Ali", "message": "Great service", "rating": 5}


def test_security_headers_present(client) -> None:
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.headers["X-Content-Type-Options"] == "nosniff"
    assert response.headers["X-Frame-Options"] == "DENY"
    assert response.headers["Referrer-Policy"] == "strict-origin-when-cross-origin"


def test_csrf_cookie_issued(client) -> None:
    client.get("/api/v1/health")
    assert client.cookies.get("gv_csrf")


def test_login_sets_hardened_cookies(client, db_session: Session) -> None:
    user_crud.create_user(
        db_session,
        email="cookie@greenvolt.com",
        password="CookiePass1",
        full_name="Cookie User",
    )
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "cookie@greenvolt.com", "password": "CookiePass1"},
    )
    assert response.status_code == 200
    cookies = " ".join(response.headers.get_list("set-cookie")).lower()
    assert "gv_access=" in cookies
    assert "httponly" in cookies
    assert "samesite=lax" in cookies


def test_admin_write_requires_csrf(client, db_session: Session) -> None:
    user_crud.create_user(
        db_session,
        email="csrf@greenvolt.com",
        password="CsrfPass1",
        full_name="CSRF Admin",
        role="admin",
    )
    login = client.post(
        "/api/v1/auth/login",
        json={"email": "csrf@greenvolt.com", "password": "CsrfPass1"},
    )
    assert login.status_code == 200

    blocked = client.post("/api/v1/admin/testimonials", json=TESTIMONIAL)
    assert blocked.status_code == 403

    token = client.cookies.get("gv_csrf")
    assert token
    client.headers["x-csrf-token"] = token
    assert client.post("/api/v1/admin/testimonials", json=TESTIMONIAL).status_code == 201


def test_rate_limit_enforced(client, monkeypatch) -> None:
    from app.core.rate_limit import limiter

    monkeypatch.setattr(limiter, "enabled", True)
    limiter.reset()

    statuses = [client.post("/api/v1/inquiries", json=INQUIRY).status_code for _ in range(7)]
    assert statuses[0] == 201
    assert statuses.count(429) >= 1


def test_register_rejects_weak_password(client, monkeypatch) -> None:
    monkeypatch.setattr(settings, "enable_user_auth", True)
    weak = client.post(
        "/api/v1/auth/register",
        json={"full_name": "Weak", "email": "weak@greenvolt.com", "password": "onlyletters"},
    )
    assert weak.status_code == 422

    strong = client.post(
        "/api/v1/auth/register",
        json={"full_name": "Strong", "email": "strong@greenvolt.com", "password": "StrongPass1"},
    )
    assert strong.status_code == 201
