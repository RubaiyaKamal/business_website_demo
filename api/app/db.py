"""Database engine and session helpers.

Uses SQLModel on top of SQLAlchemy's synchronous engine. The connection URL is
read from settings so the same code runs on PostgreSQL (dev/prod) and SQLite
(tests) without change. Models avoid backend-specific column types.
"""

from __future__ import annotations

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.core.config import settings


def _connect_args(url: str) -> dict[str, object]:
    if url.startswith("sqlite"):
        # Allow the connection to be shared across FastAPI's threadpool.
        return {"check_same_thread": False}
    return {}


engine = create_engine(
    settings.database_url,
    echo=False,
    pool_pre_ping=True,
    future=True,
    connect_args=_connect_args(settings.database_url),
)


def get_session() -> Generator[Session, None, None]:
    """FastAPI dependency yielding a scoped SQLAlchemy session."""
    with Session(engine) as session:
        yield session
