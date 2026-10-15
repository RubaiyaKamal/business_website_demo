"""Site settings endpoints (public read + admin edit)."""

from __future__ import annotations

from fastapi import APIRouter

from app.core.deps import AdminUser, DbSession
from app.crud.settings import settings_crud
from app.models.settings import DEFAULT_SETTING_KEYS
from app.schemas.settings import PublicSettings, SettingsUpdate

public_router = APIRouter(prefix="/settings", tags=["settings"])
admin_router = APIRouter(prefix="/admin/settings", tags=["admin:settings"])

_PUBLIC_FIELDS = set(PublicSettings.model_fields.keys())


@public_router.get("/public", response_model=PublicSettings)
def get_public_settings(db: DbSession) -> PublicSettings:
    values = settings_crud.all(db)
    payload = {key: values.get(key, "") for key in _PUBLIC_FIELDS}
    return PublicSettings(**payload)


@admin_router.get("", response_model=dict[str, str])
def admin_get_settings(db: DbSession, _: AdminUser) -> dict[str, str]:
    values = settings_crud.all(db)
    # Ensure every known key is present so the admin form is always complete.
    return {key: values.get(key, "") for key in DEFAULT_SETTING_KEYS}


@admin_router.put("", response_model=dict[str, str])
def admin_update_settings(payload: SettingsUpdate, db: DbSession, _: AdminUser) -> dict[str, str]:
    updates = {item.key: item.value for item in payload.items}
    return settings_crud.set_many(db, updates)
