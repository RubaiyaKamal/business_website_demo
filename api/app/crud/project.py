"""Project data access."""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.core.query import asc, column, desc
from app.crud.base import CRUDBase
from app.models.project import Project


class CRUDProject(CRUDBase[Project]):
    def list_published(
        self, db: Session, *, offset: int, limit: int
    ) -> tuple[list[Project], int]:
        conditions = [column(Project, "is_published").is_(True)]
        items = self.list_paginated(
            db,
            offset=offset,
            limit=limit,
            conditions=conditions,
            order_by=(asc(Project, "sort_order"), desc(Project, "id")),
        )
        total = self.count(db, *conditions)
        return items, total


project_crud = CRUDProject(Project)
