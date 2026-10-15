"""Small text utilities for content fields."""

from __future__ import annotations

import re

_TAG_RE = re.compile(r"<[^>]+>")
_WS_RE = re.compile(r"\s+")


def strip_html(value: str) -> str:
    return _TAG_RE.sub(" ", value)


def reading_time(value: str, words_per_minute: int = 200) -> int:
    """Estimate reading time in whole minutes (minimum 1)."""
    words = [w for w in _WS_RE.split(strip_html(value).strip()) if w]
    return max(1, round(len(words) / words_per_minute))
