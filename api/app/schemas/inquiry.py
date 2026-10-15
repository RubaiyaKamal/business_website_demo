"""Contact / enquiry schemas."""

from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.schemas.common import ORMModel

InquiryStatus = Literal["new", "read", "replied"]


class InquiryCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=40)
    subject: str = Field(min_length=2, max_length=200)
    message: str = Field(min_length=10, max_length=5000)
    service_id: int | None = None

    @field_validator("name", "subject", "message")
    @classmethod
    def _strip(cls, value: str) -> str:
        return value.strip()

    @field_validator("phone")
    @classmethod
    def _clean_phone(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = value.strip()
        return cleaned or None


class InquiryStatusUpdate(BaseModel):
    status: InquiryStatus


class InquiryRead(ORMModel):
    id: int
    name: str
    email: EmailStr
    phone: str | None
    subject: str
    message: str
    service_id: int | None
    status: InquiryStatus
    source: str
    created_at: datetime
    updated_at: datetime


class InquiryCreated(BaseModel):
    detail: str
    id: int
