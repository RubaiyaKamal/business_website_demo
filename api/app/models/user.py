"""User account and role models."""

from __future__ import annotations

from sqlmodel import Field

from app.models.base import TimestampMixin

# Role values are validated at the API boundary (Literal) and stored as strings
# so the schema stays portable between PostgreSQL and MySQL.
ROLE_ADMIN = "admin"
ROLE_USER = "user"


class User(TimestampMixin, table=True):
    __tablename__ = "users"

    id: int | None = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True, max_length=255)
    full_name: str = Field(max_length=120)
    hashed_password: str = Field(max_length=255)
    role: str = Field(default=ROLE_USER, max_length=20, index=True)
    is_active: bool = Field(default=True)

    @property
    def is_admin(self) -> bool:
        return self.role == ROLE_ADMIN
