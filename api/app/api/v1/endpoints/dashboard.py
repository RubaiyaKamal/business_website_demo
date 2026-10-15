"""Admin dashboard summary endpoint."""

from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel

from app.core.deps import AdminUser, DbSession
from app.crud.blog import blog_crud
from app.crud.inquiry import inquiry_crud
from app.crud.project import project_crud
from app.crud.service import service_crud
from app.crud.testimonial import testimonial_crud
from app.schemas.inquiry import InquiryRead

router = APIRouter(prefix="/admin", tags=["admin:dashboard"])


class DashboardStats(BaseModel):
    services: int
    projects: int
    blog_posts: int
    testimonials: int
    inquiries_total: int
    inquiries_new: int
    recent_inquiries: list[InquiryRead]


@router.get("/stats", response_model=DashboardStats)
def dashboard_stats(db: DbSession, _: AdminUser) -> DashboardStats:
    recent, total_inquiries = inquiry_crud.search(db, offset=0, limit=5)
    return DashboardStats(
        services=service_crud.count(db),
        projects=project_crud.count(db),
        blog_posts=blog_crud.count(db),
        testimonials=testimonial_crud.count(db),
        inquiries_total=total_inquiries,
        inquiries_new=inquiry_crud.count_by_status(db, "new"),
        recent_inquiries=[InquiryRead.model_validate(item) for item in recent],
    )
