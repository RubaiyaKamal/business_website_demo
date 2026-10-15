"""Blog post data access."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.query import asc, column, desc
from app.crud.base import CRUDBase
from app.models.blog import BlogPost


class CRUDBlogPost(CRUDBase[BlogPost]):
    def list_published(
        self,
        db: Session,
        *,
        offset: int,
        limit: int,
        category: str | None = None,
    ) -> tuple[list[BlogPost], int]:
        conditions = [column(BlogPost, "is_published").is_(True)]
        if category:
            conditions.append(column(BlogPost, "category") == category)
        items = self.list_paginated(
            db,
            offset=offset,
            limit=limit,
            conditions=conditions,
            order_by=(desc(BlogPost, "published_at"), desc(BlogPost, "id")),
        )
        total = self.count(db, *conditions)
        return items, total

    def list_categories(self, db: Session) -> list[str]:
        stmt = (
            select(column(BlogPost, "category"))
            .where(column(BlogPost, "is_published").is_(True))
            .distinct()
            .order_by(asc(BlogPost, "category"))
        )
        return [row for row in db.execute(stmt).scalars().all() if row]

    def related(self, db: Session, *, post: BlogPost, limit: int = 3) -> list[BlogPost]:
        category_match = (column(BlogPost, "category") == post.category).desc()
        stmt = (
            select(BlogPost)
            .where(column(BlogPost, "is_published").is_(True))
            .where(column(BlogPost, "id") != post.id)
            .order_by(category_match, desc(BlogPost, "published_at"))
            .limit(limit)
        )
        return list(db.execute(stmt).scalars().all())

    def count_published(self, db: Session) -> int:
        return self.count(db, column(BlogPost, "is_published").is_(True))


blog_crud = CRUDBlogPost(BlogPost)
