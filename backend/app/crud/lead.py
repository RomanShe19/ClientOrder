from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.lead import Lead
from app.schemas.lead import LeadCreate, LeadUpdate


async def create_lead(db: AsyncSession, data: LeadCreate) -> Lead:
    lead = Lead(**data.model_dump())
    db.add(lead)
    await db.flush()
    await db.refresh(lead)
    return lead


async def get_lead(db: AsyncSession, lead_id: int) -> Lead | None:
    stmt = (
        select(Lead)
        .options(selectinload(Lead.analytics))
        .where(Lead.id == lead_id)
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_all_leads(
    db: AsyncSession, skip: int = 0, limit: int = 100
) -> list[Lead]:
    stmt = (
        select(Lead)
        .options(selectinload(Lead.analytics))
        .offset(skip)
        .limit(limit)
        .order_by(Lead.created_at.desc())
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def update_lead(db: AsyncSession, lead_id: int, data: LeadUpdate) -> Lead | None:
    lead = await get_lead(db, lead_id)
    if lead is None:
        return None
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(lead, field, value)
    await db.flush()
    await db.refresh(lead)
    return lead


async def delete_lead(db: AsyncSession, lead_id: int) -> bool:
    lead = await get_lead(db, lead_id)
    if lead is None:
        return False
    await db.delete(lead)
    await db.flush()
    return True
