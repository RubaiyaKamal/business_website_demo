"""Typed helpers for building SQLAlchemy expressions from SQLModel classes.

SQLModel declares model attributes with their *field* type (e.g. ``int``) while
SQLAlchemy exposes them as ``InstrumentedAttribute``. Static type checkers
therefore cannot see query methods such as ``.asc()`` / ``.is_()``. These thin
wrappers centralise that boundary and keep the rest of the codebase clean.
"""

from __future__ import annotations

from typing import Any, TypeVar

ModelT = TypeVar("ModelT")


def column(model: type[Any], name: str) -> Any:
    """Return the SQL expression for a column of ``model``."""
    return getattr(model, name)


def asc(model: type[Any], name: str) -> Any:
    return column(model, name).asc()


def desc(model: type[Any], name: str) -> Any:
    return column(model, name).desc()
