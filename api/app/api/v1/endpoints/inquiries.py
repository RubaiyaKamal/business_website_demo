"""Contact / enquiry endpoints (public submit + admin inbox)."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, HTTPException, Query, Request, Response, status

from app.api.v1.utils import PageDep, total_pages
from app.core.deps import AdminUser, DbSession, get_client_ip
from app.crud.inquiry import inquiry_crud
from app.crud.service import service_crud
from app.models.inquiry import INQUIRY_STATUSES, ContactMessage
from app.schemas.common import Page
from app.schemas.inquiry import (
    InquiryCreate,
    InquiryCreated,
    InquiryRead,
    InquiryStatusUpdate,
)

public_router = APIRouter(prefix="/inquiries", tags=["inquiries"])
admin_router = APIRouter(prefix="/admin/inquiries", tags=["admin:inquiries"])


def _get_or_404(db: DbSession, inquiry_id: int) -> ContactMessage:
    item = inquiry_crud.get(db, inquiry_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inquiry not found")
    return item


# --- Public ----------------------------------------------------------------


@public_router.post("", response_model=InquiryCreated, status_code=status.HTTP_201_CREATED)
def submit_inquiry(payload: InquiryCreate, request: Request, db: DbSession) -> InquiryCreated:
    if payload.service_id is not None:
        service = service_crud.get(db, payload.service_id)
        if service is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Selected service does not exist",
            )
    inquiry = inquiry_crud.create(
        db,
        {
            **payload.model_dump(),
            "status": "new",
            "source": "website",
            "ip_address": get_client_ip(request),
        },
    )
    return InquiryCreated(detail="Your message has been received.", id=inquiry.id or 0)


# --- Admin -----------------------------------------------------------------


@admin_router.get("", response_model=Page[InquiryRead])
def admin_list_inquiries(
    pages: PageDep,
    db: DbSession,
    _: AdminUser,
    q: Annotated[str | None, Query(max_length=120)] = None,
    status_filter: Annotated[str | None, Query(alias="status")] = None,
) -> Page[InquiryRead]:
    if status_filter is not None and status_filter not in INQUIRY_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"status must be one of {', '.join(INQUIRY_STATUSES)}",
        )
    items, total = inquiry_crud.search(
        db,
        offset=pages.offset,
        limit=pages.page_size,
        q=q,
        status=status_filter,
    )
    return Page(
        items=[InquiryRead.model_validate(item) for item in items],
        total=total,
        page=pages.page,
        page_size=pages.page_size,
        pages=total_pages(total, pages.page_size),
    )


@admin_router.get("/{inquiry_id}", response_model=InquiryRead)
def admin_get_inquiry(inquiry_id: int, db: DbSession, _: AdminUser) -> InquiryRead:
    return InquiryRead.model_validate(_get_or_404(db, inquiry_id))


@admin_router.patch("/{inquiry_id}", response_model=InquiryRead)
def admin_update_inquiry(
    inquiry_id: int, payload: InquiryStatusUpdate, db: DbSession, _: AdminUser
) -> InquiryRead:
    inquiry = _get_or_404(db, inquiry_id)
    inquiry = inquiry_crud.update(db, inquiry, {"status": payload.status})
    return InquiryRead.model_validate(inquiry)


@admin_router.delete("/{inquiry_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_inquiry(inquiry_id: int, db: DbSession, _: AdminUser) -> Response:
    inquiry = _get_or_404(db, inquiry_id)
    inquiry_crud.delete(db, inquiry)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
