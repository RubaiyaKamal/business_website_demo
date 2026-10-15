"""User data access."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.query import column
from app.core.security import hash_password
from app.crud.base import CRUDBase
from app.models.user import User


class CRUDUser(CRUDBase[User]):
    def get_by_email(self, db: Session, email: str) -> User | None:
        stmt = select(User).where(column(User, "email") == email.lower())
        return db.execute(stmt).scalars().first()

    def create_user(
        self,
        db: Session,
        *,
        email: str,
        password: str,
        full_name: str,
        role: str = "user",
    ) -> User:
        user = User(
            email=email.lower(),
            full_name=full_name,
            hashed_password=hash_password(password),
            role=role,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    def set_password(self, db: Session, user: User, password: str) -> User:
        user.hashed_password = hash_password(password)
        db.add(user)
        db.commit()
        db.refresh(user)
        return user


user_crud = CRUDUser(User)
