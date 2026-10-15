"""Project endpoints (public reads + admin CRUD)."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Response, status

from app.api.v1.utils import (
    PageDep,
    resolve_create_slug,
    resolve_update_slug,
    total_pages,
)
from app.core.deps import AdminUser, DbSession
from app.core.query import asc, desc
from app.crud.project import project_crud
from app.models.project import Project
from app.schemas.common import Page
from app.schemas.project import (
    ProjectCreate,
    ProjectListItem,
    ProjectRead,
    ProjectUpdate,
)
from app.schemas.service import PublishUpdate

public_router = APIRouter(prefix="/projects", tags=["projects"])
admin_router = APIRouter(prefix="/admin/projects", tags=["admin:projects"])


def _get_or_404(db: DbSession, project_id: int) -> Project:
    project = project_crud.get(db, project_id)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


# --- Public ----------------------------------------------------------------


@public_router.get("", response_model=Page[ProjectListItem])
def list_projects(pages: PageDep, db: DbSession) -> Page[ProjectListItem]:
    items, total = project_crud.list_published(db, offset=pages.offset, limit=pages.page_size)
    return Page(
        items=[ProjectListItem.model_validate(item) for item in items],
        total=total,
        page=pages.page,
        page_size=pages.page_size,
        pages=total_pages(total, pages.page_size),
    )


@public_router.get("/{slug}", response_model=ProjectRead)
def get_project(slug: str, db: DbSession) -> ProjectRead:
    project = project_crud.get_by_slug(db, slug)
    if project is None or not project.is_published:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return ProjectRead.model_validate(project)


# --- Admin -----------------------------------------------------------------


@admin_router.get("", response_model=Page[ProjectRead])
def admin_list_projects(pages: PageDep, db: DbSession, _: AdminUser) -> Page[ProjectRead]:
    items = project_crud.list_paginated(
        db,
        offset=pages.offset,
        limit=pages.page_size,
        order_by=(asc(Project, "sort_order"), desc(Project, "id")),
    )
    total = project_crud.count(db)
    return Page(
        items=[ProjectRead.model_validate(item) for item in items],
        total=total,
        page=pages.page,
        page_size=pages.page_size,
        pages=total_pages(total, pages.page_size),
    )


@admin_router.get("/{project_id}", response_model=ProjectRead)
def admin_get_project(project_id: int, db: DbSession, _: AdminUser) -> ProjectRead:
    return ProjectRead.model_validate(_get_or_404(db, project_id))


@admin_router.post("", response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
def admin_create_project(payload: ProjectCreate, db: DbSession, _: AdminUser) -> ProjectRead:
    data = payload.model_dump(exclude={"slug"})
    data["slug"] = resolve_create_slug(
        project_crud, db, provided=payload.slug, fallback_title=payload.title
    )
    project = project_crud.create(db, data)
    return ProjectRead.model_validate(project)


@admin_router.patch("/{project_id}", response_model=ProjectRead)
def admin_update_project(
    project_id: int, payload: ProjectUpdate, db: DbSession, _: AdminUser
) -> ProjectRead:
    project = _get_or_404(db, project_id)
    data = payload.model_dump(exclude_unset=True)
    if data.get("slug"):
        data["slug"] = resolve_update_slug(
            project_crud, db, provided=data["slug"], current_id=project_id
        )
    else:
        data.pop("slug", None)
    project = project_crud.update(db, project, data)
    return ProjectRead.model_validate(project)


@admin_router.patch("/{project_id}/publish", response_model=ProjectRead)
def admin_publish_project(
    project_id: int, payload: PublishUpdate, db: DbSession, _: AdminUser
) -> ProjectRead:
    project = _get_or_404(db, project_id)
    project = project_crud.update(db, project, {"is_published": payload.is_published})
    return ProjectRead.model_validate(project)


@admin_router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_project(project_id: int, db: DbSession, _: AdminUser) -> Response:
    project = _get_or_404(db, project_id)
    project_crud.delete(db, project)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
