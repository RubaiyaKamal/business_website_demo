"""Shared helpers for v1 routers: pagination params and slug resolution."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Annotated, Any

from fastapi import Depends, HTTPException, Query, status

from app.core.slug import slugify, unique_slug
from app.crud.base import CRUDBase


@dataclass(slots=True)
class PageParams:
    page: int
    page_size: int

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.page_size


def pagination(
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 12,
) -> PageParams:
    return PageParams(page=page, page_size=page_size)


PageDep = Annotated[PageParams, Depends(pagination)]


def total_pages(total: int, page_size: int) -> int:
    if page_size <= 0:
        return 0
    return (total + page_size - 1) // page_size


def resolve_create_slug(
    crud: CRUDBase[Any],
    db: Any,
    *,
    provided: str | None,
    fallback_title: str,
) -> str:
    """Validate an explicit slug or derive a unique one from the title."""
    if provided:
        slug = slugify(provided)
        if crud.slug_exists(db, slug):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="That slug is already in use",
            )
        return slug
    return unique_slug(fallback_title, lambda candidate: crud.slug_exists(db, candidate))


def resolve_update_slug(
    crud: CRUDBase[Any],
    db: Any,
    *,
    provided: str,
    current_id: int,
) -> str:
    """Validate an updated slug, allowing the record to keep its own slug."""
    slug = slugify(provided)
    if crud.slug_exists(db, slug, exclude_id=current_id):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="That slug is already in use",
        )
    return slug
