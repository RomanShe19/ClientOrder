from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.crud import analytics as analytics_crud
from app.schemas.analytics import AnalyticsCreate, AnalyticsResponse, AnalyticsUpdate

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.post("/", response_model=AnalyticsResponse, status_code=status.HTTP_201_CREATED)
async def create_analytics(data: AnalyticsCreate, db: AsyncSession = Depends(get_db)):
    existing = await analytics_crud.get_analytics_by_lead(db, data.lead_id)
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Analytics for lead_id={data.lead_id} already exists",
        )
    return await analytics_crud.create_analytics(db, data)


@router.get("/", response_model=list[AnalyticsResponse])
async def list_analytics(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
):
    return await analytics_crud.get_all_analytics(db, skip=skip, limit=limit)


@router.get("/by-lead/{lead_id}", response_model=AnalyticsResponse)
async def get_analytics_by_lead(lead_id: int, db: AsyncSession = Depends(get_db)):
    record = await analytics_crud.get_analytics_by_lead(db, lead_id)
    if record is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analytics not found")
    return record


@router.get("/{analytics_id}", response_model=AnalyticsResponse)
async def get_analytics(analytics_id: int, db: AsyncSession = Depends(get_db)):
    record = await analytics_crud.get_analytics(db, analytics_id)
    if record is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analytics not found")
    return record


@router.patch("/{analytics_id}", response_model=AnalyticsResponse)
async def update_analytics(
    analytics_id: int, data: AnalyticsUpdate, db: AsyncSession = Depends(get_db)
):
    record = await analytics_crud.update_analytics(db, analytics_id, data)
    if record is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analytics not found")
    return record


@router.delete("/{analytics_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_analytics(analytics_id: int, db: AsyncSession = Depends(get_db)):
    deleted = await analytics_crud.delete_analytics(db, analytics_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analytics not found")
