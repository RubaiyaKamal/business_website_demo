"""Schemas for the feature-flagged AI writing helper."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

AiMode = Literal["draft", "meta"]


class AiDraftRequest(BaseModel):
    """Ask the AI to draft a blog body or a meta/excerpt description."""

    mode: AiMode
    title: str = Field(min_length=1, max_length=200)
    context: str | None = Field(default=None, max_length=4000)


class AiDraftResponse(BaseModel):
    text: str
    mode: AiMode
