"""Tests for the feature-flagged admin AI helper."""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.api.v1.endpoints import ai as ai_endpoint
from app.core.ai import AiUnavailable
from app.core.config import settings


def test_ai_requires_admin(client: TestClient) -> None:
    response = client.post("/api/v1/admin/ai/draft", json={"mode": "draft", "title": "Hi"})
    assert response.status_code == 401


def test_ai_disabled_returns_404(admin_client: TestClient) -> None:
    response = admin_client.post(
        "/api/v1/admin/ai/draft",
        json={"mode": "draft", "title": "Test topic"},
    )
    assert response.status_code == 404
    assert response.json()["detail"] == "AI helper is disabled"


def test_ai_rejects_blank_title(admin_client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(settings, "enable_ai", True)
    response = admin_client.post("/api/v1/admin/ai/draft", json={"mode": "draft", "title": ""})
    assert response.status_code == 422


def test_ai_returns_generated_text(
    admin_client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setattr(settings, "enable_ai", True)
    captured: dict[str, str] = {}

    async def fake_generate(mode: str, title: str, context: str | None) -> str:
        captured.update(mode=mode, title=title, context=context or "")
        return "Generated body text."

    monkeypatch.setattr(ai_endpoint, "generate_draft", fake_generate)

    response = admin_client.post(
        "/api/v1/admin/ai/draft",
        json={"mode": "draft", "title": "Best laptops", "context": "notes"},
    )
    assert response.status_code == 200
    assert response.json() == {"text": "Generated body text.", "mode": "draft"}
    assert captured == {"mode": "draft", "title": "Best laptops", "context": "notes"}


def test_ai_provider_error_returns_503(
    admin_client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setattr(settings, "enable_ai", True)

    async def boom(*_: object, **__: object) -> str:
        raise AiUnavailable("The AI service is unavailable right now")

    monkeypatch.setattr(ai_endpoint, "generate_draft", boom)

    response = admin_client.post(
        "/api/v1/admin/ai/draft", json={"mode": "meta", "title": "Warranty tips"}
    )
    assert response.status_code == 503
    assert "unavailable" in response.json()["detail"]


@pytest.mark.parametrize("mode", ["draft", "meta"])
def test_ai_accepts_both_modes(
    admin_client: TestClient, monkeypatch: pytest.MonkeyPatch, mode: str
) -> None:
    monkeypatch.setattr(settings, "enable_ai", True)

    async def fake(*_: object, **__: object) -> str:
        return "ok"

    monkeypatch.setattr(ai_endpoint, "generate_draft", fake)
    response = admin_client.post(
        "/api/v1/admin/ai/draft", json={"mode": mode, "title": "Title"}
    )
    assert response.status_code == 200
    assert response.json()["mode"] == mode
