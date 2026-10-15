"""Data-access layer."""

from app.crud.blog import blog_crud
from app.crud.inquiry import inquiry_crud
from app.crud.project import project_crud
from app.crud.service import service_crud
from app.crud.settings import settings_crud
from app.crud.testimonial import testimonial_crud
from app.crud.user import user_crud

__all__ = [
    "blog_crud",
    "inquiry_crud",
    "project_crud",
    "service_crud",
    "settings_crud",
    "testimonial_crud",
    "user_crud",
]
