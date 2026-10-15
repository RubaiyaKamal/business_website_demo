"""Testimonial schemas."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.common import ORMModel


class TestimonialBase(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    role: str | None = Field(default=None, max_length=120)
    message: str = Field(min_length=1)
    message_ur: str | None = None
    rating: int = Field(default=5, ge=1, le=5)
    avatar_url: str | None = Field(default=None, max_length=500)
    is_published: bool = True
    sort_order: int = 0


class TestimonialCreate(TestimonialBase):
    pass


class TestimonialUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    role: str | None = Field(default=None, max_length=120)
    message: str | None = Field(default=None, min_length=1)
    message_ur: str | None = None
    rating: int | None = Field(default=None, ge=1, le=5)
    avatar_url: str | None = Field(default=None, max_length=500)
    is_published: bool | None = None
    sort_order: int | None = None


class TestimonialRead(ORMModel):
    id: int
    name: str
    role: str | None
    message: str
    message_ur: str | None
    rating: int
    avatar_url: str | None
    is_published: bool
    sort_order: int
    created_at: datetime
    updated_at: datetime
