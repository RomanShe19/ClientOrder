from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.crud import session_tracking as st_crud
from app.schemas.session_tracking import SessionTrackingResponse, SessionTrackingUpsert

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.post(
    "/track",
    response_model=SessionTrackingResponse,
    status_code=status.HTTP_200_OK,
)
async def track_session(
    data: SessionTrackingUpsert, db: AsyncSession = Depends(get_db)
):
    return await st_crud.upsert_session(db, data)
