"""Service catalog data access."""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.core.query import asc, column
from app.crud.base import CRUDBase
from app.models.service import Service


class CRUDService(CRUDBase[Service]):
    def list_published(
        self, db: Session, *, offset: int, limit: int
    ) -> tuple[list[Service], int]:
        conditions = [column(Service, "is_published").is_(True)]
        items = self.list_paginated(
            db,
            offset=offset,
            limit=limit,
            conditions=conditions,
            order_by=(asc(Service, "sort_order"), asc(Service, "id")),
        )
        total = self.count(db, *conditions)
        return items, total


service_crud = CRUDService(Service)
