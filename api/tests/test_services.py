"""Service catalog: admin CRUD and public visibility rules."""

from __future__ import annotations

SERVICE_PAYLOAD = {
    "title": "Mobile Screen Repair",
    "summary": "Same-day screen replacement for all major brands.",
    "body": "We replace cracked screens quickly.",
    "price_from": 1500,
    "is_published": True,
}


def test_create_generates_slug(admin_client) -> None:
    response = admin_client.post("/api/v1/admin/services", json=SERVICE_PAYLOAD)
    assert response.status_code == 201, response.text
    body = response.json()
    assert body["slug"] == "mobile-screen-repair"
    assert body["title"] == "Mobile Screen Repair"


def test_create_rejects_duplicate_slug(admin_client) -> None:
    admin_client.post("/api/v1/admin/services", json=SERVICE_PAYLOAD)
    duplicate = admin_client.post(
        "/api/v1/admin/services",
        json={**SERVICE_PAYLOAD, "slug": "mobile-screen-repair"},
    )
    assert duplicate.status_code == 409


def test_create_validation_error(admin_client) -> None:
    response = admin_client.post("/api/v1/admin/services", json={"title": "", "summary": "x"})
    assert response.status_code == 422


def test_public_list_only_published(admin_client) -> None:
    admin_client.post("/api/v1/admin/services", json=SERVICE_PAYLOAD)
    admin_client.post(
        "/api/v1/admin/services",
        json={**SERVICE_PAYLOAD, "title": "Hidden Service", "is_published": False},
    )

    public = admin_client.get("/api/v1/services")
    assert public.status_code == 200
    body = public.json()
    assert body["total"] == 1
    assert body["items"][0]["slug"] == "mobile-screen-repair"


def test_public_get_unpublished_returns_404(admin_client) -> None:
    created = admin_client.post(
        "/api/v1/admin/services",
        json={**SERVICE_PAYLOAD, "is_published": False},
    ).json()
    assert admin_client.get(f"/api/v1/services/{created['slug']}").status_code == 404


def test_update_publish_and_delete(admin_client) -> None:
    created = admin_client.post("/api/v1/admin/services", json=SERVICE_PAYLOAD).json()
    service_id = created["id"]

    updated = admin_client.patch(
        f"/api/v1/admin/services/{service_id}",
        json={"summary": "Updated summary text."},
    )
    assert updated.status_code == 200
    assert updated.json()["summary"] == "Updated summary text."

    unpublished = admin_client.patch(
        f"/api/v1/admin/services/{service_id}/publish",
        json={"is_published": False},
    )
    assert unpublished.status_code == 200
    assert unpublished.json()["is_published"] is False

    assert admin_client.delete(f"/api/v1/admin/services/{service_id}").status_code == 204
    assert admin_client.get(f"/api/v1/admin/services/{service_id}").status_code == 404


def test_pagination_metadata(admin_client) -> None:
    for index in range(3):
        admin_client.post(
            "/api/v1/admin/services",
            json={**SERVICE_PAYLOAD, "title": f"Service {index}"},
        )
    response = admin_client.get("/api/v1/admin/services?page=1&page_size=2")
    body = response.json()
    assert body["total"] == 3
    assert body["pages"] == 2
    assert len(body["items"]) == 2
