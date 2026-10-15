"""Admin media uploads.

Files are written to ``settings.media_root`` and served read-only from ``/media``.
Only raster image types are accepted — SVG is intentionally rejected because it can
carry embedded scripts.
"""

from __future__ import annotations

import uuid
from pathlib import Path

from fastapi import APIRouter, HTTPException, UploadFile, status
from pydantic import BaseModel

from app.core.config import settings
from app.core.deps import AdminUser

router = APIRouter(prefix="/admin/uploads", tags=["admin:uploads"])

_ALLOWED_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/avif": ".avif",
}

_CHUNK = 1024 * 1024


class UploadResult(BaseModel):
    url: str
    filename: str
    size: int
    content_type: str


def media_dir() -> Path:
    path = Path(settings.media_root)
    path.mkdir(parents=True, exist_ok=True)
    return path


@router.post("", response_model=UploadResult, status_code=status.HTTP_201_CREATED)
async def upload_image(file: UploadFile, _: AdminUser) -> UploadResult:
    extension = _ALLOWED_TYPES.get(file.content_type or "")
    if extension is None:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Only JPEG, PNG, WebP, GIF or AVIF images are allowed",
        )

    contents = bytearray()
    while chunk := await file.read(_CHUNK):
        contents.extend(chunk)
        if len(contents) > settings.max_upload_bytes:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File exceeds the {settings.max_upload_mb} MB limit",
            )

    if not contents:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Uploaded file is empty",
        )

    filename = f"{uuid.uuid4().hex}{extension}"
    (media_dir() / filename).write_bytes(contents)

    return UploadResult(
        url=f"/media/uploads/{filename}",
        filename=filename,
        size=len(contents),
        content_type=file.content_type or "application/octet-stream",
    )
