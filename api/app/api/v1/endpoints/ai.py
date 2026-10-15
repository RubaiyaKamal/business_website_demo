"""Admin AI writing helper (feature-flagged via ``ENABLE_AI``).

Drafts are suggestions only: they are returned to the editor and never saved or
published automatically.
"""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from app.core.ai import AiUnavailable, generate_draft
from app.core.config import settings
from app.core.deps import AdminUser
from app.schemas.ai import AiDraftRequest, AiDraftResponse

router = APIRouter(prefix="/admin/ai", tags=["admin:ai"])


@router.post("/draft", response_model=AiDraftResponse)
async def admin_ai_draft(payload: AiDraftRequest, _: AdminUser) -> AiDraftResponse:
    if not settings.enable_ai:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="AI helper is disabled",
        )
    try:
        text = await generate_draft(payload.mode, payload.title, payload.context)
    except AiUnavailable as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc
    return AiDraftResponse(text=text, mode=payload.mode)
