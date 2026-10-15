"""Generic CRUD helpers shared by all resources."""

from __future__ import annotations

from collections.abc import Sequence
from typing import Any, Generic, TypeVar

from sqlalchemy import func, select
from sqlalchemy.orm import Session
from sqlmodel import SQLModel

from app.core.query import column
from app.models.base import utcnow

ModelT = TypeVar("ModelT", bound=SQLModel)


class CRUDBase(Generic[ModelT]):
    """Thin, typed wrapper around common SQLAlchemy operations."""

    def __init__(self, model: type[ModelT]) -> None:
        self.model = model

    def get(self, db: Session, obj_id: int) -> ModelT | None:
        return db.get(self.model, obj_id)

    def get_by_field(self, db: Session, field: str, value: Any) -> ModelT | None:
        return (
            db.execute(select(self.model).where(column(self.model, field) == value))
            .scalars()
            .first()
        )

    def get_by_slug(self, db: Session, slug: str) -> ModelT | None:
        return self.get_by_field(db, "slug", slug)

    def count(self, db: Session, *conditions: Any) -> int:
        stmt = select(func.count()).select_from(self.model)
        if conditions:
            stmt = stmt.where(*conditions)
        return int(db.execute(stmt).scalar_one())

    def list_paginated(
        self,
        db: Session,
        *,
        offset: int,
        limit: int,
        conditions: list[Any] | None = None,
        order_by: Sequence[Any] | None = None,
    ) -> list[ModelT]:
        stmt = select(self.model)
        if conditions:
            stmt = stmt.where(*conditions)
        if order_by is not None:
            stmt = stmt.order_by(*order_by)
        stmt = stmt.offset(offset).limit(limit)
        return list(db.execute(stmt).scalars().all())

    def create(self, db: Session, data: dict[str, Any]) -> ModelT:
        obj = self.model(**data)
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj

    def update(self, db: Session, obj: ModelT, data: dict[str, Any]) -> ModelT:
        for key, value in data.items():
            setattr(obj, key, value)
        if hasattr(obj, "updated_at"):
            obj.updated_at = utcnow()
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj

    def delete(self, db: Session, obj: ModelT) -> None:
        db.delete(obj)
        db.commit()

    def slug_exists(self, db: Session, slug: str, exclude_id: int | None = None) -> bool:
        conditions = [column(self.model, "slug") == slug]
        if exclude_id is not None:
            conditions.append(column(self.model, "id") != exclude_id)
        stmt = select(func.count()).select_from(self.model).where(*conditions)
        return int(db.execute(stmt).scalar_one()) > 0
