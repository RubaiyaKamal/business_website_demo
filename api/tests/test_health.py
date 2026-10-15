from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_root_health() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["service"] == "greenvolt-api"


def test_api_health() -> None:
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
