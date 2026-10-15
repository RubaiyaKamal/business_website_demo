"""Service catalog schemas."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field, field_validator

from app.schemas.common import ORMModel


class ServiceBase(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    title_ur: str | None = Field(default=None, max_length=160)
    summary: str = Field(min_length=1, max_length=400)
    summary_ur: str | None = Field(default=None, max_length=400)
    body: str = ""
    body_ur: str | None = None
    icon: str | None = Field(default=None, max_length=60)
    image_url: str | None = Field(default=None, max_length=500)
    price_from: float | None = Field(default=None, ge=0)
    is_published: bool = True
    sort_order: int = 0


class ServiceCreate(ServiceBase):
    slug: str | None = Field(default=None, max_length=140)

    @field_validator("title", "summary")
    @classmethod
    def _strip(cls, value: str) -> str:
        return value.strip()


class ServiceUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=160)
    title_ur: str | None = Field(default=None, max_length=160)
    summary: str | None = Field(default=None, min_length=1, max_length=400)
    summary_ur: str | None = Field(default=None, max_length=400)
    body: str | None = None
    body_ur: str | None = None
    icon: str | None = Field(default=None, max_length=60)
    image_url: str | None = Field(default=None, max_length=500)
    price_from: float | None = Field(default=None, ge=0)
    is_published: bool | None = None
    sort_order: int | None = None
    slug: str | None = Field(default=None, max_length=140)


class ServiceRead(ORMModel):
    id: int
    slug: str
    title: str
    title_ur: str | None
    summary: str
    summary_ur: str | None
    body: str
    body_ur: str | None
    icon: str | None
    image_url: str | None
    price_from: float | None
    is_published: bool
    sort_order: int
    created_at: datetime
    updated_at: datetime


class ServiceListItem(ORMModel):
    id: int
    slug: str
    title: str
    title_ur: str | None
    summary: str
    summary_ur: str | None
    icon: str | None
    image_url: str | None
    price_from: float | None


class PublishUpdate(BaseModel):
    is_published: bool
