"""Feature-flagged AI writing helper (OpenAI chat completions).

Kept dependency-light and isolated so the API stays importable even when the
optional ``openai`` package or a key is missing, and so tests can stub it.
"""

from __future__ import annotations

import logging

from app.core.config import settings

logger = logging.getLogger(__name__)


class AiUnavailable(RuntimeError):
    """Raised when AI is disabled, unconfigured, or the provider errors."""


_MODE_PROMPTS = {
    "draft": (
        "You are a friendly copywriter for GreenVolt Electronics, a trusted "
        "electronics shop in Karachi that sells mobiles, laptops, TVs and "
        "appliances and offers warranty repairs. Write a clear, helpful blog "
        "post body in English (150-300 words) as simple paragraphs. Use plain "
        "language, no markdown headings, and never invent prices or guarantees."
    ),
    "meta": (
        "You write concise SEO meta descriptions. Given a blog title (and any "
        "context), return a single plain-text description of 140-160 characters "
        "that starts with the key benefit. No quotes, no markdown, one sentence "
        "or two at most."
    ),
}


async def generate_draft(mode: str, title: str, context: str | None = None) -> str:
    """Return AI-generated text for ``mode`` ("draft" or "meta").

    Raises ``AiUnavailable`` for every failure mode so callers can map it to a
    clean HTTP response instead of leaking provider details.
    """
    if not settings.enable_ai:
        raise AiUnavailable("The AI helper is disabled")
    if not settings.openai_api_key:
        raise AiUnavailable("The AI helper is not configured (missing OPENAI_API_KEY)")

    try:
        from openai import AsyncOpenAI
    except ImportError as exc:  # pragma: no cover - openai is a declared dependency
        raise AiUnavailable("The AI client library is not installed") from exc

    system_prompt = _MODE_PROMPTS.get(mode, _MODE_PROMPTS["draft"])
    user_prompt = f"Title: {title.strip()}"
    if context and context.strip():
        user_prompt += f"\n\nExisting notes or body:\n{context.strip()[:4000]}"

    client = AsyncOpenAI(api_key=settings.openai_api_key)
    try:
        completion = await client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.7,
            max_tokens=700,
        )
    except Exception as exc:  # noqa: BLE001 - surface any provider failure uniformly
        logger.warning("AI request failed: %s", exc)
        raise AiUnavailable("The AI service is unavailable right now") from exc

    text = (completion.choices[0].message.content or "").strip()
    if not text:
        raise AiUnavailable("The AI service returned an empty response")
    return text
