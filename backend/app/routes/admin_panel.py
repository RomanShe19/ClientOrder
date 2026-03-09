from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select
from datetime import datetime, timezone, timedelta

from app.core.database import get_db
from app.core.security import get_current_admin, require_superadmin
from app.crud import admin_user as admin_crud
from app.models.lead import Lead
from app.models.session_tracking import SessionTracking
from app.schemas.admin_user import AdminResponse, AdminUpdate

router = APIRouter(prefix="/v1/admin", tags=["admin-panel"])


@router.get("/dashboard/stats")
async def dashboard_stats(
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Dashboard widget data: lead counts, active admin, lead temperature stats."""
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)

    total_leads = (await db.execute(select(func.count(Lead.id)))).scalar_one()
    new_today = (
        await db.execute(
            select(func.count(Lead.id)).where(Lead.created_at >= today_start)
        )
    ).scalar_one()
    active_admins = await admin_crud.get_active_admin_count(db)

    from app.services.lead_scoring import analyze_lead
    all_leads_stmt = select(Lead).order_by(Lead.created_at.desc()).limit(2000)
    all_result = await db.execute(all_leads_stmt)
    all_leads = list(all_result.scalars().all())
    hot_count = warm_count = cold_count = 0
    for lead in all_leads:
        a = analyze_lead(
            budget=lead.budget or "",
            company_size=lead.company_size or "",
            client_role=lead.client_role or "",
            result_deadline=lead.result_deadline or "",
            business_niche=lead.business_niche,
            task_volume=lead.task_volume,
            comments=lead.comments,
        )
        if a["temperature"] == "hot":
            hot_count += 1
        elif a["temperature"] == "warm":
            warm_count += 1
        else:
            cold_count += 1

    return {
        "total_leads": total_leads,
        "new_leads_today": new_today,
        "active_admins": active_admins,
        "leads_hot": hot_count,
        "leads_warm": warm_count,
        "leads_cold": cold_count,
    }


@router.get("/dashboard/analytics")
async def dashboard_analytics(
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Aggregated user behavior analytics: avg time + heatmap data."""
    now = datetime.now(timezone.utc)
    day_ago = now - timedelta(days=1)
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)

    avg_day = (
        await db.execute(
            select(func.avg(SessionTracking.page_time_seconds))
            .where(SessionTracking.created_at >= day_ago)
        )
    ).scalar_one() or 0

    avg_week = (
        await db.execute(
            select(func.avg(SessionTracking.page_time_seconds))
            .where(SessionTracking.created_at >= week_ago)
        )
    ).scalar_one() or 0

    avg_month = (
        await db.execute(
            select(func.avg(SessionTracking.page_time_seconds))
            .where(SessionTracking.created_at >= month_ago)
        )
    ).scalar_one() or 0

    total_sessions = (
        await db.execute(select(func.count(SessionTracking.id)))
    ).scalar_one()

    max_time = (
        await db.execute(select(func.max(SessionTracking.page_time_seconds)))
    ).scalar_one() or 0

    all_sessions = (
        await db.execute(
            select(
                SessionTracking.cursor_heatmap,
                SessionTracking.cursor_positions,
                SessionTracking.button_clicks,
            )
        )
    ).all()

    heatmap_grid: dict[str, int] = defaultdict(int)
    button_clicks_agg: dict[str, int] = defaultdict(int)
    raw_positions: list[dict] = []

    for row in all_sessions:
        grid = row[0] or {}
        positions = row[1] or []
        clicks = row[2] or {}

        for zone, count in grid.items():
            heatmap_grid[zone] += int(count)
        for btn, count in clicks.items():
            button_clicks_agg[btn] += int(count)
        for pos in positions:
            if isinstance(pos, dict) and "x" in pos and "y" in pos:
                raw_positions.append({"x": pos["x"], "y": pos["y"]})

    return {
        "avg_time_day": round(float(avg_day)),
        "avg_time_week": round(float(avg_week)),
        "avg_time_month": round(float(avg_month)),
        "max_time": int(max_time),
        "total_sessions": total_sessions,
        "heatmap_grid": dict(heatmap_grid),
        "cursor_positions": raw_positions[:50000],
        "button_clicks": dict(
            sorted(button_clicks_agg.items(), key=lambda x: -x[1])[:50]
        ),
    }


@router.get("/leads")
async def list_leads(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    budget: str | None = Query(None),
    date_from: str | None = Query(None),
    date_to: str | None = Query(None),
    sort: str = Query("urgency", description="urgency | date"),
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Paginated leads list with optional filters. Sorted by urgency by default."""
    from app.services.lead_scoring import analyze_lead

    stmt = select(Lead)
    if budget:
        stmt = stmt.where(Lead.budget == budget)
    if date_from:
        try:
            dt = datetime.fromisoformat(date_from)
            stmt = stmt.where(Lead.created_at >= dt)
        except ValueError:
            pass
    if date_to:
        try:
            dt = datetime.fromisoformat(date_to) + timedelta(days=1)
            stmt = stmt.where(Lead.created_at < dt)
        except ValueError:
            pass

    stmt = stmt.order_by(Lead.created_at.desc()).limit(5000)
    result = await db.execute(stmt)
    leads_raw = list(result.scalars().all())
    total = len(leads_raw)

    if sort == "urgency":
        scored = []
        for lead in leads_raw:
            a = analyze_lead(
                budget=lead.budget or "",
                company_size=lead.company_size or "",
                client_role=lead.client_role or "",
                result_deadline=lead.result_deadline or "",
                business_niche=lead.business_niche,
                task_volume=lead.task_volume,
                comments=lead.comments,
            )
            scored.append((lead, a))
        scored.sort(key=lambda x: -x[1]["score"])
        leads_raw = [s[0] for s in scored]

    paginated = leads_raw[skip : skip + limit]
    items = []
    for lead in paginated:
        a = analyze_lead(
            budget=lead.budget or "",
            company_size=lead.company_size or "",
            client_role=lead.client_role or "",
            result_deadline=lead.result_deadline or "",
            business_niche=lead.business_niche,
            task_volume=lead.task_volume,
            comments=lead.comments,
        )
        items.append({
            "id": lead.id,
            "first_name": lead.first_name,
            "last_name": lead.last_name,
            "contact_phone": lead.contact_phone,
            "contact_email": lead.contact_email,
            "business_niche": lead.business_niche,
            "company_size": lead.company_size,
            "client_role": lead.client_role,
            "budget": lead.budget,
            "task_type": lead.task_type,
            "result_deadline": lead.result_deadline,
            "created_at": lead.created_at.isoformat() if lead.created_at else None,
            "analysis": a,
        })

    return {
        "items": items,
        "total": total,
        "skip": skip,
        "limit": limit,
    }


@router.get("/leads/{lead_id}")
async def get_lead_detail(
    lead_id: int,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Full lead details by ID with intelligent analysis."""
    from app.crud.lead import get_lead
    from app.services.lead_scoring import analyze_lead

    lead = await get_lead(db, lead_id)
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")

    analysis = analyze_lead(
        budget=lead.budget or "",
        company_size=lead.company_size or "",
        client_role=lead.client_role or "",
        result_deadline=lead.result_deadline or "",
        business_niche=lead.business_niche,
        task_volume=lead.task_volume,
        comments=lead.comments,
    )

    return {
        "id": lead.id,
        "first_name": lead.first_name,
        "last_name": lead.last_name,
        "middle_name": lead.middle_name,
        "contact_phone": lead.contact_phone,
        "contact_email": lead.contact_email,
        "business_niche": lead.business_niche,
        "company_size": lead.company_size,
        "task_volume": lead.task_volume,
        "client_role": lead.client_role,
        "budget": lead.budget,
        "preferred_contact_method": lead.preferred_contact_method,
        "preferred_contact_time": lead.preferred_contact_time,
        "product_interest": lead.product_interest,
        "task_type": lead.task_type,
        "result_deadline": lead.result_deadline,
        "comments": lead.comments,
        "created_at": lead.created_at.isoformat() if lead.created_at else None,
        "updated_at": lead.updated_at.isoformat() if lead.updated_at else None,
        "analysis": analysis,
    }


@router.get("/list", response_model=list[AdminResponse])
async def list_admins(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """List all admin accounts."""
    admins = await admin_crud.get_all_admins(db, skip=skip, limit=limit)
    return [AdminResponse.model_validate(a) for a in admins]


@router.get("/{admin_id}", response_model=AdminResponse)
async def get_admin(
    admin_id: int,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Get admin details by ID."""
    admin = await admin_crud.get_admin_by_id(db, admin_id)
    if not admin:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Admin not found")
    return AdminResponse.model_validate(admin)


@router.put("/{admin_id}", response_model=AdminResponse)
async def update_admin(
    admin_id: int,
    data: AdminUpdate,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(require_superadmin),
):
    """Update admin (superadmin only)."""
    admin = await admin_crud.update_admin(db, admin_id, data)
    if not admin:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Admin not found")
    return AdminResponse.model_validate(admin)


@router.delete("/{admin_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_admin(
    admin_id: int,
    db: AsyncSession = Depends(get_db),
    current=Depends(require_superadmin),
):
    """Delete admin (superadmin only). Cannot delete self."""
    if current.id == admin_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete yourself")
    deleted = await admin_crud.delete_admin(db, admin_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Admin not found")
