"""Service catalog endpoints (public reads + admin CRUD)."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Response, status

from app.api.v1.utils import (
    PageDep,
    resolve_create_slug,
    resolve_update_slug,
    total_pages,
)
from app.core.deps import AdminUser, DbSession
from app.core.query import asc
from app.crud.service import service_crud
from app.models.service import Service
from app.schemas.common import Page
from app.schemas.service import (
    PublishUpdate,
    ServiceCreate,
    ServiceListItem,
    ServiceRead,
    ServiceUpdate,
)

public_router = APIRouter(prefix="/services", tags=["services"])
admin_router = APIRouter(prefix="/admin/services", tags=["admin:services"])


# --- Public ----------------------------------------------------------------


@public_router.get("", response_model=Page[ServiceListItem])
def list_services(pages: PageDep, db: DbSession) -> Page[ServiceListItem]:
    items, total = service_crud.list_published(db, offset=pages.offset, limit=pages.page_size)
    return Page(
        items=[ServiceListItem.model_validate(item) for item in items],
        total=total,
        page=pages.page,
        page_size=pages.page_size,
        pages=total_pages(total, pages.page_size),
    )


@public_router.get("/{slug}", response_model=ServiceRead)
def get_service(slug: str, db: DbSession) -> ServiceRead:
    service = service_crud.get_by_slug(db, slug)
    if service is None or not service.is_published:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    return ServiceRead.model_validate(service)


# --- Admin -----------------------------------------------------------------


def _get_or_404(db: DbSession, service_id: int) -> Service:
    service = service_crud.get(db, service_id)
    if service is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    return service


@admin_router.get("", response_model=Page[ServiceRead])
def admin_list_services(pages: PageDep, db: DbSession, _: AdminUser) -> Page[ServiceRead]:
    items = service_crud.list_paginated(
        db,
        offset=pages.offset,
        limit=pages.page_size,
        order_by=(asc(Service, "sort_order"), asc(Service, "id")),
    )
    total = service_crud.count(db)
    return Page(
        items=[ServiceRead.model_validate(item) for item in items],
        total=total,
        page=pages.page,
        page_size=pages.page_size,
        pages=total_pages(total, pages.page_size),
    )


@admin_router.get("/{service_id}", response_model=ServiceRead)
def admin_get_service(service_id: int, db: DbSession, _: AdminUser) -> ServiceRead:
    return ServiceRead.model_validate(_get_or_404(db, service_id))


@admin_router.post("", response_model=ServiceRead, status_code=status.HTTP_201_CREATED)
def admin_create_service(payload: ServiceCreate, db: DbSession, _: AdminUser) -> ServiceRead:
    data = payload.model_dump(exclude={"slug"})
    data["slug"] = resolve_create_slug(
        service_crud, db, provided=payload.slug, fallback_title=payload.title
    )
    service = service_crud.create(db, data)
    return ServiceRead.model_validate(service)


@admin_router.patch("/{service_id}", response_model=ServiceRead)
def admin_update_service(
    service_id: int, payload: ServiceUpdate, db: DbSession, _: AdminUser
) -> ServiceRead:
    service = _get_or_404(db, service_id)
    data = payload.model_dump(exclude_unset=True)
    if data.get("slug"):
        data["slug"] = resolve_update_slug(
            service_crud, db, provided=data["slug"], current_id=service_id
        )
    else:
        data.pop("slug", None)
    service = service_crud.update(db, service, data)
    return ServiceRead.model_validate(service)


@admin_router.patch("/{service_id}/publish", response_model=ServiceRead)
def admin_publish_service(
    service_id: int, payload: PublishUpdate, db: DbSession, _: AdminUser
) -> ServiceRead:
    service = _get_or_404(db, service_id)
    service = service_crud.update(db, service, {"is_published": payload.is_published})
    return ServiceRead.model_validate(service)


@admin_router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_service(service_id: int, db: DbSession, _: AdminUser) -> Response:
    service = _get_or_404(db, service_id)
    service_crud.delete(db, service)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
