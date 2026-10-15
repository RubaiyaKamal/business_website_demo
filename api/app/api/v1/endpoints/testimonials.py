"""Testimonial endpoints (public read + admin CRUD)."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Response, status

from app.api.v1.utils import PageDep, total_pages
from app.core.deps import AdminUser, DbSession
from app.core.query import asc, desc
from app.crud.testimonial import testimonial_crud
from app.models.testimonial import Testimonial
from app.schemas.common import Page
from app.schemas.service import PublishUpdate
from app.schemas.testimonial import (
    TestimonialCreate,
    TestimonialRead,
    TestimonialUpdate,
)

public_router = APIRouter(prefix="/testimonials", tags=["testimonials"])
admin_router = APIRouter(prefix="/admin/testimonials", tags=["admin:testimonials"])


def _get_or_404(db: DbSession, testimonial_id: int) -> Testimonial:
    item = testimonial_crud.get(db, testimonial_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Testimonial not found")
    return item


# --- Public ----------------------------------------------------------------


@public_router.get("", response_model=list[TestimonialRead])
def list_testimonials(db: DbSession) -> list[TestimonialRead]:
    items = testimonial_crud.list_published(db)
    return [TestimonialRead.model_validate(item) for item in items]


# --- Admin -----------------------------------------------------------------


@admin_router.get("", response_model=Page[TestimonialRead])
def admin_list_testimonials(pages: PageDep, db: DbSession, _: AdminUser) -> Page[TestimonialRead]:
    items = testimonial_crud.list_paginated(
        db,
        offset=pages.offset,
        limit=pages.page_size,
        order_by=(asc(Testimonial, "sort_order"), desc(Testimonial, "id")),
    )
    total = testimonial_crud.count(db)
    return Page(
        items=[TestimonialRead.model_validate(item) for item in items],
        total=total,
        page=pages.page,
        page_size=pages.page_size,
        pages=total_pages(total, pages.page_size),
    )


@admin_router.get("/{testimonial_id}", response_model=TestimonialRead)
def admin_get_testimonial(testimonial_id: int, db: DbSession, _: AdminUser) -> TestimonialRead:
    return TestimonialRead.model_validate(_get_or_404(db, testimonial_id))


@admin_router.post("", response_model=TestimonialRead, status_code=status.HTTP_201_CREATED)
def admin_create_testimonial(
    payload: TestimonialCreate, db: DbSession, _: AdminUser
) -> TestimonialRead:
    item = testimonial_crud.create(db, payload.model_dump())
    return TestimonialRead.model_validate(item)


@admin_router.patch("/{testimonial_id}", response_model=TestimonialRead)
def admin_update_testimonial(
    testimonial_id: int, payload: TestimonialUpdate, db: DbSession, _: AdminUser
) -> TestimonialRead:
    item = _get_or_404(db, testimonial_id)
    item = testimonial_crud.update(db, item, payload.model_dump(exclude_unset=True))
    return TestimonialRead.model_validate(item)


@admin_router.patch("/{testimonial_id}/publish", response_model=TestimonialRead)
def admin_publish_testimonial(
    testimonial_id: int, payload: PublishUpdate, db: DbSession, _: AdminUser
) -> TestimonialRead:
    item = _get_or_404(db, testimonial_id)
    item = testimonial_crud.update(db, item, {"is_published": payload.is_published})
    return TestimonialRead.model_validate(item)


@admin_router.delete("/{testimonial_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_testimonial(testimonial_id: int, db: DbSession, _: AdminUser) -> Response:
    item = _get_or_404(db, testimonial_id)
    testimonial_crud.delete(db, item)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
