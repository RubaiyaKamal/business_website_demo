"""Customer testimonial model."""

from __future__ import annotations

from sqlalchemy import Column, Text
from sqlmodel import Field

from app.models.base import TimestampMixin


class Testimonial(TimestampMixin, table=True):
    __tablename__ = "testimonials"

    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(max_length=120)
    role: str | None = Field(default=None, max_length=120)
    message: str = Field(sa_column=Column(Text, nullable=False))
    message_ur: str | None = Field(default=None, sa_column=Column(Text, nullable=True))
    rating: int = Field(default=5, ge=1, le=5)
    avatar_url: str | None = Field(default=None, max_length=500)
    is_published: bool = Field(default=True, index=True)
    sort_order: int = Field(default=0, index=True)
