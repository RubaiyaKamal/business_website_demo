"""Blog post model."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import JSON, Column, Text
from sqlmodel import Field

from app.models.base import TimestampMixin


class BlogPost(TimestampMixin, table=True):
    __tablename__ = "blog_posts"

    id: int | None = Field(default=None, primary_key=True)
    slug: str = Field(index=True, unique=True, max_length=180)
    title: str = Field(max_length=200)
    title_ur: str | None = Field(default=None, max_length=200)
    excerpt: str = Field(max_length=400)
    excerpt_ur: str | None = Field(default=None, max_length=400)
    body: str = Field(default="", sa_column=Column(Text, nullable=False, default=""))
    body_ur: str | None = Field(default=None, sa_column=Column(Text, nullable=True))
    cover_image_url: str | None = Field(default=None, max_length=500)
    category: str = Field(default="News", max_length=80, index=True)
    tags: list[str] = Field(
        default_factory=list,
        sa_column=Column(JSON, nullable=False, default=list),
    )
    reading_time: int = Field(default=1, ge=1)
    author_id: int | None = Field(default=None, foreign_key="users.id", index=True)
    is_published: bool = Field(default=False, index=True)
    published_at: datetime | None = Field(default=None, index=True)
