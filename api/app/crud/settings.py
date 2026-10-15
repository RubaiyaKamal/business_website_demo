"""Site settings data access (key/value)."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.query import column
from app.models.settings import SiteSetting


class CRUDSettings:
    def all(self, db: Session) -> dict[str, str]:
        rows = db.execute(select(SiteSetting)).scalars().all()
        return {row.key: row.value for row in rows}

    def get(self, db: Session, key: str, default: str = "") -> str:
        row = (
            db.execute(select(SiteSetting).where(column(SiteSetting, "key") == key))
            .scalars()
            .first()
        )
        return row.value if row else default

    def set(self, db: Session, key: str, value: str) -> SiteSetting:
        row = (
            db.execute(select(SiteSetting).where(column(SiteSetting, "key") == key))
            .scalars()
            .first()
        )
        if row is None:
            row = SiteSetting(key=key, value=value)
        else:
            row.value = value
        db.add(row)
        db.commit()
        db.refresh(row)
        return row

    def set_many(self, db: Session, items: dict[str, str]) -> dict[str, str]:
        for key, value in items.items():
            self.set(db, key, value)
        return self.all(db)


settings_crud = CRUDSettings()
