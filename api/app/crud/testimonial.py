"""Testimonial data access."""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.core.query import asc, column, desc
from app.crud.base import CRUDBase
from app.models.testimonial import Testimonial


class CRUDTestimonial(CRUDBase[Testimonial]):
    def list_published(self, db: Session, *, limit: int | None = None) -> list[Testimonial]:
        return self.list_paginated(
            db,
            offset=0,
            limit=limit or 1000,
            conditions=[column(Testimonial, "is_published").is_(True)],
            order_by=(asc(Testimonial, "sort_order"), desc(Testimonial, "id")),
        )


testimonial_crud = CRUDTestimonial(Testimonial)
