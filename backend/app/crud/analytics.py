from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.analytics import Analytics
from app.schemas.analytics import AnalyticsCreate, AnalyticsUpdate


async def create_analytics(db: AsyncSession, data: AnalyticsCreate) -> Analytics:
    record = Analytics(**data.model_dump())
    db.add(record)
    await db.flush()
    await db.refresh(record)
    return record


async def get_analytics(db: AsyncSession, analytics_id: int) -> Analytics | None:
    stmt = select(Analytics).where(Analytics.id == analytics_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_analytics_by_lead(db: AsyncSession, lead_id: int) -> Analytics | None:
    stmt = select(Analytics).where(Analytics.lead_id == lead_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_all_analytics(
    db: AsyncSession, skip: int = 0, limit: int = 100
) -> list[Analytics]:
    stmt = (
        select(Analytics)
        .offset(skip)
        .limit(limit)
        .order_by(Analytics.created_at.desc())
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def update_analytics(
    db: AsyncSession, analytics_id: int, data: AnalyticsUpdate
) -> Analytics | None:
    record = await get_analytics(db, analytics_id)
    if record is None:
        return None
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(record, field, value)
    await db.flush()
    await db.refresh(record)
    return record


async def delete_analytics(db: AsyncSession, analytics_id: int) -> bool:
    record = await get_analytics(db, analytics_id)
    if record is None:
        return False
    await db.delete(record)
    await db.flush()
    return True
