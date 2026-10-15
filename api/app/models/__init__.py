"""Import all models so SQLModel metadata and Alembic autogenerate see them."""

from app.models.base import TimestampMixin, utcnow
from app.models.blog import BlogPost
from app.models.inquiry import INQUIRY_STATUSES, ContactMessage
from app.models.project import Project
from app.models.service import Service
from app.models.settings import DEFAULT_SETTING_KEYS, SiteSetting
from app.models.testimonial import Testimonial
from app.models.user import ROLE_ADMIN, ROLE_USER, User

__all__ = [
    "TimestampMixin",
    "utcnow",
    "BlogPost",
    "ContactMessage",
    "INQUIRY_STATUSES",
    "Project",
    "Service",
    "SiteSetting",
    "DEFAULT_SETTING_KEYS",
    "Testimonial",
    "User",
    "ROLE_ADMIN",
    "ROLE_USER",
]
