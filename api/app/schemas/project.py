"""Project schemas."""

from __future__ import annotations

from datetime import date, datetime

from pydantic import BaseModel, Field

from app.schemas.common import ORMModel


class ProjectBase(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    title_ur: str | None = Field(default=None, max_length=160)
    summary: str = Field(min_length=1, max_length=400)
    summary_ur: str | None = Field(default=None, max_length=400)
    body: str = ""
    body_ur: str | None = None
    client: str | None = Field(default=None, max_length=160)
    image_url: str | None = Field(default=None, max_length=500)
    gallery: list[str] = Field(default_factory=list)
    completed_at: date | None = None
    is_published: bool = True
    sort_order: int = 0


class ProjectCreate(ProjectBase):
    slug: str | None = Field(default=None, max_length=140)


class ProjectUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=160)
    title_ur: str | None = Field(default=None, max_length=160)
    summary: str | None = Field(default=None, min_length=1, max_length=400)
    summary_ur: str | None = Field(default=None, max_length=400)
    body: str | None = None
    body_ur: str | None = None
    client: str | None = Field(default=None, max_length=160)
    image_url: str | None = Field(default=None, max_length=500)
    gallery: list[str] | None = None
    completed_at: date | None = None
    is_published: bool | None = None
    sort_order: int | None = None
    slug: str | None = Field(default=None, max_length=140)


class ProjectRead(ORMModel):
    id: int
    slug: str
    title: str
    title_ur: str | None
    summary: str
    summary_ur: str | None
    body: str
    body_ur: str | None
    client: str | None
    image_url: str | None
    gallery: list[str]
    completed_at: date | None
    is_published: bool
    sort_order: int
    created_at: datetime
    updated_at: datetime


class ProjectListItem(ORMModel):
    id: int
    slug: str
    title: str
    title_ur: str | None
    summary: str
    summary_ur: str | None
    client: str | None
    image_url: str | None
    completed_at: date | None
