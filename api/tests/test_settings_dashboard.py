"""Public/admin settings and dashboard stats."""

from __future__ import annotations

from app.models.settings import DEFAULT_SETTING_KEYS


def test_public_settings_returns_all_fields(client) -> None:
    response = client.get("/api/v1/settings/public")
    assert response.status_code == 200
    body = response.json()
    assert "contact_email" in body
    assert "whatsapp_number" in body


def test_admin_update_and_read_settings(admin_client) -> None:
    current = admin_client.get("/api/v1/admin/settings")
    assert current.status_code == 200
    assert set(current.json().keys()) == set(DEFAULT_SETTING_KEYS)

    update = admin_client.put(
        "/api/v1/admin/settings",
        json={
            "items": [
                {"key": "whatsapp_number", "value": "923001234567"},
                {"key": "address_city", "value": "Karachi"},
            ]
        },
    )
    assert update.status_code == 200
    assert update.json()["whatsapp_number"] == "923001234567"

    public = admin_client.get("/api/v1/settings/public").json()
    assert public["whatsapp_number"] == "923001234567"


def test_settings_requires_admin(client) -> None:
    assert client.get("/api/v1/admin/settings").status_code == 401
    assert client.put("/api/v1/admin/settings", json={"items": []}).status_code == 401


def test_dashboard_stats(admin_client) -> None:
    admin_client.post(
        "/api/v1/admin/services",
        json={"title": "Repair", "summary": "Fix devices", "is_published": True},
    )
    admin_client.post(
        "/api/v1/inquiries",
        json={
            "name": "Ahmed",
            "email": "a@greenvolt.com",
            "subject": "Hello",
            "message": "This is a long enough message body.",
        },
    )

    stats = admin_client.get("/api/v1/admin/stats")
    assert stats.status_code == 200
    body = stats.json()
    assert body["services"] == 1
    assert body["inquiries_total"] == 1
    assert body["inquiries_new"] == 1
    assert len(body["recent_inquiries"]) == 1
