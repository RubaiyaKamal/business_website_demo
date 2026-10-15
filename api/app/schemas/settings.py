"""Site settings schemas."""

from __future__ import annotations

from pydantic import BaseModel, Field


class SettingItem(BaseModel):
    key: str = Field(min_length=1, max_length=80)
    value: str = Field(default="", max_length=2000)


class SettingsUpdate(BaseModel):
    items: list[SettingItem]


class PublicSettings(BaseModel):
    """Subset of settings safe to expose on the public site."""

    contact_email: str = ""
    contact_phone: str = ""
    whatsapp_number: str = ""
    address_street: str = ""
    address_city: str = ""
    google_maps_embed_url: str = ""
    google_analytics_id: str = ""
    social_facebook: str = ""
    social_instagram: str = ""
    social_tiktok: str = ""
    shop_hours: str = ""
