"""Response hardening middleware: security headers + CSRF cookie bootstrap."""

from __future__ import annotations

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

from app.core.config import settings
from app.core.csrf import set_csrf_cookie

_HSTS = "max-age=63072000; includeSubDomains; preload"

_STATIC_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "X-DNS-Prefetch-Control": "off",
}


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to every response and ensure a CSRF cookie exists."""

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        response = await call_next(request)

        for header, value in _STATIC_HEADERS.items():
            response.headers.setdefault(header, value)
        if settings.enable_hsts:
            response.headers.setdefault("Strict-Transport-Security", _HSTS)

        if settings.csrf_cookie_name not in request.cookies:
            set_csrf_cookie(response)

        return response
