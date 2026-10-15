"""Contact/enquiry: public submission and admin inbox management."""

from __future__ import annotations

INQUIRY = {
    "name": "Ahmed Khan",
    "email": "ahmed@greenvolt.com",
    "phone": "0300 1234567",
    "subject": "Laptop repair quote",
    "message": "My laptop screen is cracked. What would a replacement cost?",
}


def test_submit_inquiry_saves_and_returns_id(client) -> None:
    response = client.post("/api/v1/inquiries", json=INQUIRY)
    assert response.status_code == 201, response.text
    body = response.json()
    assert body["id"] > 0
    assert "received" in body["detail"].lower()


def test_submit_inquiry_validation(client) -> None:
    response = client.post("/api/v1/inquiries", json={**INQUIRY, "message": "short"})
    assert response.status_code == 422


def test_submit_inquiry_unknown_service(client) -> None:
    response = client.post("/api/v1/inquiries", json={**INQUIRY, "service_id": 9999})
    assert response.status_code == 422


def test_admin_inbox_search_and_status(admin_client) -> None:
    admin_client.post("/api/v1/inquiries", json=INQUIRY)
    admin_client.post(
        "/api/v1/inquiries",
        json={
            **INQUIRY,
            "name": "Fatima",
            "email": "fatima@greenvolt.com",
            "subject": "TV delivery",
        },
    )

    listed = admin_client.get("/api/v1/admin/inquiries")
    assert listed.status_code == 200
    assert listed.json()["total"] == 2

    search = admin_client.get("/api/v1/admin/inquiries?q=fatima")
    assert search.json()["total"] == 1

    inquiry_id = listed.json()["items"][0]["id"]
    updated = admin_client.patch(
        f"/api/v1/admin/inquiries/{inquiry_id}", json={"status": "replied"}
    )
    assert updated.status_code == 200
    assert updated.json()["status"] == "replied"

    filtered = admin_client.get("/api/v1/admin/inquiries?status=replied")
    assert filtered.json()["total"] == 1

    assert admin_client.delete(f"/api/v1/admin/inquiries/{inquiry_id}").status_code == 204


def test_inquiry_status_validation(admin_client) -> None:
    created = admin_client.post("/api/v1/inquiries", json=INQUIRY).json()
    response = admin_client.patch(
        f"/api/v1/admin/inquiries/{created['id']}", json={"status": "bogus"}
    )
    assert response.status_code == 422


def test_admin_inbox_requires_auth(client) -> None:
    assert client.get("/api/v1/admin/inquiries").status_code == 401
