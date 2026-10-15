"""Blog endpoints (public reads + admin CRUD)."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, HTTPException, Query, Response, status

from app.api.v1.utils import (
    PageDep,
    resolve_create_slug,
    resolve_update_slug,
    total_pages,
)
from app.core.deps import AdminUser, DbSession
from app.core.query import desc
from app.core.text import reading_time
from app.crud.blog import blog_crud
from app.crud.user import user_crud
from app.models.base import utcnow
from app.models.blog import BlogPost
from app.schemas.blog import (
    AuthorMini,
    BlogPostCreate,
    BlogPostListItem,
    BlogPostRead,
    BlogPostUpdate,
)
from app.schemas.common import Page
from app.schemas.service import PublishUpdate

public_router = APIRouter(prefix="/blog", tags=["blog"])
admin_router = APIRouter(prefix="/admin/blog", tags=["admin:blog"])


def _to_read(db: DbSession, post: BlogPost) -> BlogPostRead:
    read = BlogPostRead.model_validate(post)
    if post.author_id:
        author = user_crud.get(db, post.author_id)
        if author is not None:
            read.author = AuthorMini.model_validate(author)
    return read


def _get_or_404(db: DbSession, post_id: int) -> BlogPost:
    post = blog_crud.get(db, post_id)
    if post is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    return post


# --- Public ----------------------------------------------------------------


@public_router.get("", response_model=Page[BlogPostListItem])
def list_posts(
    pages: PageDep,
    db: DbSession,
    category: Annotated[str | None, Query(max_length=80)] = None,
) -> Page[BlogPostListItem]:
    items, total = blog_crud.list_published(
        db, offset=pages.offset, limit=pages.page_size, category=category
    )
    return Page(
        items=[BlogPostListItem.model_validate(item) for item in items],
        total=total,
        page=pages.page,
        page_size=pages.page_size,
        pages=total_pages(total, pages.page_size),
    )


@public_router.get("/categories", response_model=list[str])
def list_categories(db: DbSession) -> list[str]:
    return blog_crud.list_categories(db)


@public_router.get("/{slug}", response_model=BlogPostRead)
def get_post(slug: str, db: DbSession) -> BlogPostRead:
    post = blog_crud.get_by_slug(db, slug)
    if post is None or not post.is_published:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    return _to_read(db, post)


@public_router.get("/{slug}/related", response_model=list[BlogPostListItem])
def related_posts(slug: str, db: DbSession) -> list[BlogPostListItem]:
    post = blog_crud.get_by_slug(db, slug)
    if post is None or not post.is_published:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    related = blog_crud.related(db, post=post, limit=3)
    return [BlogPostListItem.model_validate(item) for item in related]


# --- Admin -----------------------------------------------------------------


@admin_router.get("", response_model=Page[BlogPostRead])
def admin_list_posts(pages: PageDep, db: DbSession, _: AdminUser) -> Page[BlogPostRead]:
    items = blog_crud.list_paginated(
        db,
        offset=pages.offset,
        limit=pages.page_size,
        order_by=(desc(BlogPost, "created_at"), desc(BlogPost, "id")),
    )
    total = blog_crud.count(db)
    return Page(
        items=[_to_read(db, item) for item in items],
        total=total,
        page=pages.page,
        page_size=pages.page_size,
        pages=total_pages(total, pages.page_size),
    )


@admin_router.get("/{post_id}", response_model=BlogPostRead)
def admin_get_post(post_id: int, db: DbSession, _: AdminUser) -> BlogPostRead:
    return _to_read(db, _get_or_404(db, post_id))


@admin_router.post("", response_model=BlogPostRead, status_code=status.HTTP_201_CREATED)
def admin_create_post(payload: BlogPostCreate, db: DbSession, admin: AdminUser) -> BlogPostRead:
    data = payload.model_dump(exclude={"slug"})
    data["slug"] = resolve_create_slug(
        blog_crud, db, provided=payload.slug, fallback_title=payload.title
    )
    data["author_id"] = admin.id
    data["reading_time"] = reading_time(payload.body)
    if payload.is_published and data.get("published_at") is None:
        data["published_at"] = utcnow()
    post = blog_crud.create(db, data)
    return _to_read(db, post)


@admin_router.patch("/{post_id}", response_model=BlogPostRead)
def admin_update_post(
    post_id: int, payload: BlogPostUpdate, db: DbSession, _: AdminUser
) -> BlogPostRead:
    post = _get_or_404(db, post_id)
    data = payload.model_dump(exclude_unset=True)

    if data.get("slug"):
        data["slug"] = resolve_update_slug(
            blog_crud, db, provided=data["slug"], current_id=post_id
        )
    else:
        data.pop("slug", None)

    if "body" in data:
        data["reading_time"] = reading_time(data["body"])
    if data.get("is_published") and post.published_at is None:
        data["published_at"] = utcnow()

    post = blog_crud.update(db, post, data)
    return _to_read(db, post)


@admin_router.patch("/{post_id}/publish", response_model=BlogPostRead)
def admin_publish_post(
    post_id: int, payload: PublishUpdate, db: DbSession, _: AdminUser
) -> BlogPostRead:
    post = _get_or_404(db, post_id)
    data: dict[str, object] = {"is_published": payload.is_published}
    if payload.is_published and post.published_at is None:
        data["published_at"] = utcnow()
    post = blog_crud.update(db, post, data)
    return _to_read(db, post)


@admin_router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_post(post_id: int, db: DbSession, _: AdminUser) -> Response:
    post = _get_or_404(db, post_id)
    blog_crud.delete(db, post)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
