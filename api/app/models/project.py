"""Project / showcase model."""

from __future__ import annotations

from datetime import date

from sqlalchemy import JSON, Column, Text
from sqlmodel import Field

from app.models.base import TimestampMixin


class Project(TimestampMixin, table=True):
    __tablename__ = "projects"

    id: int | None = Field(default=None, primary_key=True)
    slug: str = Field(index=True, unique=True, max_length=140)
    title: str = Field(max_length=160)
    title_ur: str | None = Field(default=None, max_length=160)
    summary: str = Field(max_length=400)
    summary_ur: str | None = Field(default=None, max_length=400)
    body: str = Field(default="", sa_column=Column(Text, nullable=False, default=""))
    body_ur: str | None = Field(default=None, sa_column=Column(Text, nullable=True))
    client: str | None = Field(default=None, max_length=160)
    image_url: str | None = Field(default=None, max_length=500)
    gallery: list[str] = Field(
        default_factory=list,
        sa_column=Column(JSON, nullable=False, default=list),
    )
    completed_at: date | None = Field(default=None)
    is_published: bool = Field(default=True, index=True)
    sort_order: int = Field(default=0, index=True)
