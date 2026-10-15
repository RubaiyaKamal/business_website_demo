"""Shared model helpers and base classes."""

from __future__ import annotations

from datetime import UTC, datetime

from sqlmodel import Field, SQLModel


def utcnow() -> datetime:
    """Timezone-naive UTC timestamp, stored portably across all backends."""
    return datetime.now(UTC).replace(tzinfo=None)


class TimestampMixin(SQLModel):
    """Adds created/updated timestamps to a table model."""

    created_at: datetime = Field(default_factory=utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=utcnow, nullable=False)
