"""URL slug helpers (ASCII-only, portable across content types)."""

from __future__ import annotations

import re
import unicodedata
from collections.abc import Callable

_NON_ALNUM = re.compile(r"[^a-z0-9]+")


def slugify(value: str) -> str:
    """Convert arbitrary text into a lowercase, hyphenated slug."""
    normalized = unicodedata.normalize("NFKD", value)
    ascii_only = normalized.encode("ascii", "ignore").decode("ascii")
    slug = _NON_ALNUM.sub("-", ascii_only.lower()).strip("-")
    return slug or "item"


def unique_slug(base: str, exists: Callable[[str], bool]) -> str:
    """Return ``base`` if free, otherwise append ``-2``, ``-3`` ... until free.

    ``exists`` is a predicate receiving a candidate slug and returning whether
    it is already taken.
    """
    candidate = slugify(base)
    if not exists(candidate):
        return candidate
    index = 2
    while exists(f"{candidate}-{index}"):
        index += 1
    return f"{candidate}-{index}"
