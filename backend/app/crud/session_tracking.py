from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.session_tracking import SessionTracking
from app.schemas.session_tracking import SessionTrackingUpsert


async def upsert_session(
    db: AsyncSession, data: SessionTrackingUpsert
) -> SessionTracking:
    stmt = select(SessionTracking).where(
        SessionTracking.session_id == data.session_id
    )
    result = await db.execute(stmt)
    record = result.scalar_one_or_none()

    payload = data.model_dump()
    positions_new = payload.pop("cursor_positions")

    if record is None:
        record = SessionTracking(
            **payload,
            cursor_positions=[p for p in positions_new],
        )
        db.add(record)
    else:
        merged = list(record.cursor_positions or [])
        merged.extend(positions_new)
        record.cursor_positions = merged

        for field, value in payload.items():
            if field == "session_id":
                continue
            setattr(record, field, value)

    await db.flush()
    await db.refresh(record)
    return record


async def get_session_by_id(
    db: AsyncSession, session_id: str
) -> SessionTracking | None:
    stmt = select(SessionTracking).where(
        SessionTracking.session_id == session_id
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def link_session_to_lead(
    db: AsyncSession, session_id: str, lead_id: int
) -> SessionTracking | None:
    record = await get_session_by_id(db, session_id)
    if record is None:
        return None
    record.lead_id = lead_id
    await db.flush()
    await db.refresh(record)
    return record
