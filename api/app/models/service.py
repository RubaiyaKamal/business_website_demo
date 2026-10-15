"""Service catalog model."""

from __future__ import annotations

from sqlalchemy import Column, Text
from sqlmodel import Field

from app.models.base import TimestampMixin


class Service(TimestampMixin, table=True):
    __tablename__ = "services"

    id: int | None = Field(default=None, primary_key=True)
    slug: str = Field(index=True, unique=True, max_length=140)
    title: str = Field(max_length=160)
    title_ur: str | None = Field(default=None, max_length=160)
    summary: str = Field(max_length=400)
    summary_ur: str | None = Field(default=None, max_length=400)
    body: str = Field(default="", sa_column=Column(Text, nullable=False, default=""))
    body_ur: str | None = Field(default=None, sa_column=Column(Text, nullable=True))
    icon: str | None = Field(default=None, max_length=60)
    image_url: str | None = Field(default=None, max_length=500)
    price_from: float | None = Field(default=None, ge=0)
    is_published: bool = Field(default=True, index=True)
    sort_order: int = Field(default=0, index=True)
