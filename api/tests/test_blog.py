"""Blog: reading time, publish flow, categories and related posts."""

from __future__ import annotations

POST = {
    "title": "How to Choose a Phone",
    "excerpt": "A simple guide to picking a phone that fits your budget.",
    "body": (
        "First paragraph about phones.\n\n"
        "Second paragraph with more detail.\n\n"
        "- point one\n- point two"
    ),
    "category": "Buying Guides",
    "is_published": True,
}


def test_create_sets_reading_time_and_published_at(admin_client) -> None:
    response = admin_client.post("/api/v1/admin/blog", json=POST)
    assert response.status_code == 201, response.text
    body = response.json()
    assert body["slug"] == "how-to-choose-a-phone"
    assert body["reading_time"] >= 1
    assert body["published_at"] is not None
    assert body["author"] is not None
    assert body["author"]["full_name"] == "Test Admin"


def test_draft_not_visible_until_published(admin_client) -> None:
    created = admin_client.post(
        "/api/v1/admin/blog", json={**POST, "is_published": False}
    ).json()
    assert created["published_at"] is None
    assert admin_client.get(f"/api/v1/blog/{created['slug']}").status_code == 404

    published = admin_client.patch(
        f"/api/v1/admin/blog/{created['id']}/publish", json={"is_published": True}
    )
    assert published.status_code == 200
    assert published.json()["published_at"] is not None
    assert admin_client.get(f"/api/v1/blog/{created['slug']}").status_code == 200


def test_categories_and_related(admin_client) -> None:
    admin_client.post("/api/v1/admin/blog", json=POST)
    admin_client.post(
        "/api/v1/admin/blog",
        json={**POST, "title": "Second Phone Guide", "category": "Buying Guides"},
    )
    admin_client.post(
        "/api/v1/admin/blog",
        json={**POST, "title": "Laptop Tips", "category": "Repair Tips"},
    )

    categories = admin_client.get("/api/v1/blog/categories")
    assert set(categories.json()) == {"Buying Guides", "Repair Tips"}

    related = admin_client.get("/api/v1/blog/how-to-choose-a-phone/related")
    assert related.status_code == 200
    slugs = [item["slug"] for item in related.json()]
    assert "how-to-choose-a-phone" not in slugs
    assert "second-phone-guide" in slugs


def test_filter_by_category(admin_client) -> None:
    admin_client.post("/api/v1/admin/blog", json=POST)
    admin_client.post(
        "/api/v1/admin/blog",
        json={**POST, "title": "Laptop Tips", "category": "Repair Tips"},
    )

    filtered = admin_client.get("/api/v1/blog?category=Repair Tips")
    assert filtered.json()["total"] == 1
    assert filtered.json()["items"][0]["title"] == "Laptop Tips"
