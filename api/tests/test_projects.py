"""Project showcase: admin CRUD, gallery handling and public visibility."""

from __future__ import annotations

PROJECT_PAYLOAD = {
    "title": "Cafe POS and CCTV Setup",
    "summary": "Point-of-sale terminals and camera coverage for a busy cafe.",
    "body": "We installed four cameras and two tills.",
    "client": "Karachi Cafe",
    "gallery": ["/media/uploads/one.jpg", "/media/uploads/two.jpg"],
    "completed_at": "2024-05-01",
    "is_published": True,
}


def test_create_generates_slug_and_keeps_gallery(admin_client) -> None:
    response = admin_client.post("/api/v1/admin/projects", json=PROJECT_PAYLOAD)
    assert response.status_code == 201, response.text
    body = response.json()
    assert body["slug"] == "cafe-pos-and-cctv-setup"
    assert body["gallery"] == PROJECT_PAYLOAD["gallery"]
    assert body["client"] == "Karachi Cafe"


def test_create_rejects_duplicate_slug(admin_client) -> None:
    admin_client.post("/api/v1/admin/projects", json=PROJECT_PAYLOAD)
    duplicate = admin_client.post(
        "/api/v1/admin/projects",
        json={**PROJECT_PAYLOAD, "slug": "cafe-pos-and-cctv-setup"},
    )
    assert duplicate.status_code == 409


def test_public_list_excludes_unpublished(admin_client) -> None:
    admin_client.post("/api/v1/admin/projects", json=PROJECT_PAYLOAD)
    admin_client.post(
        "/api/v1/admin/projects",
        json={**PROJECT_PAYLOAD, "title": "Secret Job", "is_published": False},
    )

    public = admin_client.get("/api/v1/projects")
    assert public.status_code == 200
    body = public.json()
    assert body["total"] == 1
    item = body["items"][0]
    assert item["slug"] == "cafe-pos-and-cctv-setup"
    # List items are lean: no body/gallery leaked to the listing.
    assert "body" not in item
    assert "gallery" not in item


def test_public_detail_returns_gallery(admin_client) -> None:
    created = admin_client.post("/api/v1/admin/projects", json=PROJECT_PAYLOAD).json()
    detail = admin_client.get(f"/api/v1/projects/{created['slug']}")
    assert detail.status_code == 200
    assert detail.json()["gallery"] == PROJECT_PAYLOAD["gallery"]


def test_unpublished_detail_is_hidden(admin_client) -> None:
    created = admin_client.post(
        "/api/v1/admin/projects",
        json={**PROJECT_PAYLOAD, "is_published": False},
    ).json()
    assert admin_client.get(f"/api/v1/projects/{created['slug']}").status_code == 404


def test_update_gallery_and_delete(admin_client) -> None:
    created = admin_client.post("/api/v1/admin/projects", json=PROJECT_PAYLOAD).json()

    updated = admin_client.patch(
        f"/api/v1/admin/projects/{created['id']}",
        json={"gallery": ["/media/uploads/three.jpg"]},
    )
    assert updated.status_code == 200
    assert updated.json()["gallery"] == ["/media/uploads/three.jpg"]

    assert admin_client.delete(f"/api/v1/admin/projects/{created['id']}").status_code == 204
    assert admin_client.get(f"/api/v1/admin/projects/{created['id']}").status_code == 404
