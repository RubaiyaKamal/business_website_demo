"""Blog post schemas."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.common import ORMModel


class BlogPostBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    title_ur: str | None = Field(default=None, max_length=200)
    excerpt: str = Field(min_length=1, max_length=400)
    excerpt_ur: str | None = Field(default=None, max_length=400)
    body: str = ""
    body_ur: str | None = None
    cover_image_url: str | None = Field(default=None, max_length=500)
    category: str = Field(default="News", max_length=80)
    tags: list[str] = Field(default_factory=list)
    is_published: bool = False


class BlogPostCreate(BlogPostBase):
    slug: str | None = Field(default=None, max_length=180)
    published_at: datetime | None = None


class BlogPostUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    title_ur: str | None = Field(default=None, max_length=200)
    excerpt: str | None = Field(default=None, min_length=1, max_length=400)
    excerpt_ur: str | None = Field(default=None, max_length=400)
    body: str | None = None
    body_ur: str | None = None
    cover_image_url: str | None = Field(default=None, max_length=500)
    category: str | None = Field(default=None, max_length=80)
    tags: list[str] | None = None
    is_published: bool | None = None
    published_at: datetime | None = None
    slug: str | None = Field(default=None, max_length=180)


class AuthorMini(ORMModel):
    id: int
    full_name: str


class BlogPostRead(ORMModel):
    id: int
    slug: str
    title: str
    title_ur: str | None
    excerpt: str
    excerpt_ur: str | None
    body: str
    body_ur: str | None
    cover_image_url: str | None
    category: str
    tags: list[str]
    reading_time: int
    author: AuthorMini | None = None
    is_published: bool
    published_at: datetime | None
    created_at: datetime
    updated_at: datetime


class BlogPostListItem(ORMModel):
    id: int
    slug: str
    title: str
    title_ur: str | None
    excerpt: str
    excerpt_ur: str | None
    cover_image_url: str | None
    category: str
    reading_time: int
    published_at: datetime | None
