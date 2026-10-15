"""Key/value site settings (contact details, social links, map, analytics, ...)."""

from __future__ import annotations

from sqlalchemy import Column, Text
from sqlmodel import Field

from app.models.base import TimestampMixin


class SiteSetting(TimestampMixin, table=True):
    __tablename__ = "site_settings"

    id: int | None = Field(default=None, primary_key=True)
    key: str = Field(index=True, unique=True, max_length=80)
    value: str = Field(default="", sa_column=Column(Text, nullable=False, default=""))


# Canonical setting keys seeded on first run and editable from the admin panel.
DEFAULT_SETTING_KEYS: tuple[str, ...] = (
    "contact_email",
    "contact_phone",
    "whatsapp_number",
    "address_street",
    "address_city",
    "google_maps_embed_url",
    "google_analytics_id",
    "social_facebook",
    "social_instagram",
    "social_tiktok",
    "shop_hours",
)
