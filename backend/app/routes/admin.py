from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.crud import admin as admin_crud
from app.schemas.admin import AdminConfigCreate, AdminConfigResponse, AdminConfigUpdate

router = APIRouter(prefix="/admin/configs", tags=["admin"])


@router.post("/", response_model=AdminConfigResponse, status_code=status.HTTP_201_CREATED)
async def create_config(data: AdminConfigCreate, db: AsyncSession = Depends(get_db)):
    existing = await admin_crud.get_config_by_key(db, data.config_key)
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Config key '{data.config_key}' already exists",
        )
    return await admin_crud.create_config(db, data)


@router.get("/", response_model=list[AdminConfigResponse])
async def list_configs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    active_only: bool = Query(False),
    db: AsyncSession = Depends(get_db),
):
    return await admin_crud.get_all_configs(db, skip=skip, limit=limit, active_only=active_only)


@router.get("/by-key/{config_key}", response_model=AdminConfigResponse)
async def get_config_by_key(config_key: str, db: AsyncSession = Depends(get_db)):
    config = await admin_crud.get_config_by_key(db, config_key)
    if config is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Config not found")
    return config


@router.get("/{config_id}", response_model=AdminConfigResponse)
async def get_config(config_id: int, db: AsyncSession = Depends(get_db)):
    config = await admin_crud.get_config(db, config_id)
    if config is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Config not found")
    return config


@router.patch("/{config_id}", response_model=AdminConfigResponse)
async def update_config(
    config_id: int, data: AdminConfigUpdate, db: AsyncSession = Depends(get_db)
):
    config = await admin_crud.update_config(db, config_id, data)
    if config is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Config not found")
    return config


@router.delete("/{config_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_config(config_id: int, db: AsyncSession = Depends(get_db)):
    deleted = await admin_crud.delete_config(db, config_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Config not found")
