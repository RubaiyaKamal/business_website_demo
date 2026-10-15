"""FastAPI application factory and entrypoint."""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import __version__
from app.api.v1.router import api_router
from app.core.config import settings


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.project_name,
        version=__version__,
        docs_url="/docs" if not settings.is_production else None,
        redoc_url="/redoc" if not settings.is_production else None,
        openapi_url="/openapi.json" if not settings.is_production else None,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health", tags=["ops"])
    def health() -> dict[str, str]:
        return {"status": "ok", "service": "greenvolt-api", "version": __version__}

    app.include_router(api_router, prefix=settings.api_v1_prefix)

    return app


app = create_app()
