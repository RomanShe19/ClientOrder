from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.admin import AdminConfig
from app.schemas.admin import AdminConfigCreate, AdminConfigUpdate


async def create_config(db: AsyncSession, data: AdminConfigCreate) -> AdminConfig:
    config = AdminConfig(**data.model_dump())
    db.add(config)
    await db.flush()
    await db.refresh(config)
    return config


async def get_config(db: AsyncSession, config_id: int) -> AdminConfig | None:
    stmt = select(AdminConfig).where(AdminConfig.id == config_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_config_by_key(db: AsyncSession, key: str) -> AdminConfig | None:
    stmt = select(AdminConfig).where(AdminConfig.config_key == key)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_all_configs(
    db: AsyncSession, skip: int = 0, limit: int = 100, active_only: bool = False
) -> list[AdminConfig]:
    stmt = select(AdminConfig).offset(skip).limit(limit).order_by(AdminConfig.config_key)
    if active_only:
        stmt = stmt.where(AdminConfig.is_active.is_(True))
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def update_config(
    db: AsyncSession, config_id: int, data: AdminConfigUpdate
) -> AdminConfig | None:
    config = await get_config(db, config_id)
    if config is None:
        return None
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(config, field, value)
    await db.flush()
    await db.refresh(config)
    return config


async def delete_config(db: AsyncSession, config_id: int) -> bool:
    config = await get_config(db, config_id)
    if config is None:
        return False
    await db.delete(config)
    await db.flush()
    return True
