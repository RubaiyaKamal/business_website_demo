"""Aggregate all v1 API routers."""

from __future__ import annotations

from fastapi import APIRouter

api_router = APIRouter()


@api_router.get("/health", tags=["ops"])
def api_health() -> dict[str, str]:
    """API-namespaced health check (mirrors the root /health probe)."""
    return {"status": "ok", "service": "greenvolt-api"}
