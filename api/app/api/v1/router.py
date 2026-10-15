"""Aggregate all v1 API routers."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Request

from app.api.v1.endpoints import (
    auth,
    blog,
    dashboard,
    inquiries,
    projects,
    services,
    settings,
    testimonials,
    uploads,
)
from app.core.csrf import require_csrf
from app.core.deps import AdminUser


def admin_guard(admin: AdminUser, request: Request) -> None:
    """Authenticate the admin first (401/403), then enforce CSRF on writes."""
    require_csrf(request)


_ADMIN_DEPS = [Depends(admin_guard)]

api_router = APIRouter()


@api_router.get("/health", tags=["ops"])
def api_health() -> dict[str, str]:
    """API-namespaced health check (mirrors the root /health probe)."""
    return {"status": "ok", "service": "greenvolt-api"}


api_router.include_router(auth.router)

api_router.include_router(services.public_router)
api_router.include_router(projects.public_router)
api_router.include_router(blog.public_router)
api_router.include_router(testimonials.public_router)
api_router.include_router(inquiries.public_router)
api_router.include_router(settings.public_router)

api_router.include_router(dashboard.router, dependencies=_ADMIN_DEPS)
api_router.include_router(services.admin_router, dependencies=_ADMIN_DEPS)
api_router.include_router(projects.admin_router, dependencies=_ADMIN_DEPS)
api_router.include_router(blog.admin_router, dependencies=_ADMIN_DEPS)
api_router.include_router(testimonials.admin_router, dependencies=_ADMIN_DEPS)
api_router.include_router(inquiries.admin_router, dependencies=_ADMIN_DEPS)
api_router.include_router(settings.admin_router, dependencies=_ADMIN_DEPS)
api_router.include_router(uploads.router, dependencies=_ADMIN_DEPS)
