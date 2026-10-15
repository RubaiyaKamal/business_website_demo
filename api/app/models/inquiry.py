"""Contact / enquiry message model."""

from __future__ import annotations

from sqlalchemy import Column, Text
from sqlmodel import Field

from app.models.base import TimestampMixin

# Status values: "new" -> "read" -> "replied". Validated at the API boundary.
STATUS_NEW = "new"
STATUS_READ = "read"
STATUS_REPLIED = "replied"
INQUIRY_STATUSES = (STATUS_NEW, STATUS_READ, STATUS_REPLIED)


class ContactMessage(TimestampMixin, table=True):
    __tablename__ = "contact_messages"

    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(max_length=120)
    email: str = Field(index=True, max_length=255)
    phone: str | None = Field(default=None, max_length=40)
    subject: str = Field(max_length=200)
    message: str = Field(sa_column=Column(Text, nullable=False))
    service_id: int | None = Field(default=None, foreign_key="services.id", index=True)
    status: str = Field(default=STATUS_NEW, max_length=20, index=True)
    source: str = Field(default="website", max_length=40)
    ip_address: str | None = Field(default=None, max_length=64)
