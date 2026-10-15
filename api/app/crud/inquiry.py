"""Contact message data access."""

from __future__ import annotations

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.query import column, desc
from app.crud.base import CRUDBase
from app.models.inquiry import ContactMessage


class CRUDInquiry(CRUDBase[ContactMessage]):
    def search(
        self,
        db: Session,
        *,
        offset: int,
        limit: int,
        q: str | None = None,
        status: str | None = None,
    ) -> tuple[list[ContactMessage], int]:
        conditions: list[object] = []
        if status:
            conditions.append(column(ContactMessage, "status") == status)
        if q:
            pattern = f"%{q.strip()}%"
            conditions.append(
                or_(
                    column(ContactMessage, "name").ilike(pattern),
                    column(ContactMessage, "email").ilike(pattern),
                    column(ContactMessage, "subject").ilike(pattern),
                    column(ContactMessage, "message").ilike(pattern),
                )
            )
        items = self.list_paginated(
            db,
            offset=offset,
            limit=limit,
            conditions=conditions,
            order_by=(desc(ContactMessage, "created_at"), desc(ContactMessage, "id")),
        )
        total = self.count(db, *conditions)
        return items, total

    def count_by_status(self, db: Session, status: str) -> int:
        return self.count(db, column(ContactMessage, "status") == status)


inquiry_crud = CRUDInquiry(ContactMessage)
