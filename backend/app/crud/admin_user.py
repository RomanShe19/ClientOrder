from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password, verify_password
from app.models.admin_user import Admin
from app.schemas.admin_user import AdminCreate, AdminUpdate


async def create_admin(db: AsyncSession, data: AdminCreate) -> Admin:
    admin = Admin(
        username=data.username,
        email=data.email,
        password_hash=hash_password(data.password),
        role=data.role,
    )
    db.add(admin)
    await db.flush()
    await db.refresh(admin)
    return admin


async def get_admin_by_id(db: AsyncSession, admin_id: int) -> Admin | None:
    stmt = select(Admin).where(Admin.id == admin_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_admin_by_username(db: AsyncSession, username: str) -> Admin | None:
    stmt = select(Admin).where(Admin.username == username)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_admin_by_email(db: AsyncSession, email: str) -> Admin | None:
    stmt = select(Admin).where(Admin.email == email)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_all_admins(
    db: AsyncSession, skip: int = 0, limit: int = 100
) -> list[Admin]:
    stmt = (
        select(Admin)
        .offset(skip)
        .limit(limit)
        .order_by(Admin.created_at.desc())
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_admin_count(db: AsyncSession) -> int:
    stmt = select(func.count(Admin.id))
    result = await db.execute(stmt)
    return result.scalar_one()


async def get_active_admin_count(db: AsyncSession) -> int:
    stmt = select(func.count(Admin.id)).where(Admin.is_active.is_(True))
    result = await db.execute(stmt)
    return result.scalar_one()


async def update_admin(
    db: AsyncSession, admin_id: int, data: AdminUpdate
) -> Admin | None:
    admin = await get_admin_by_id(db, admin_id)
    if admin is None:
        return None
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(admin, field, value)
    await db.flush()
    await db.refresh(admin)
    return admin


async def delete_admin(db: AsyncSession, admin_id: int) -> bool:
    admin = await get_admin_by_id(db, admin_id)
    if admin is None:
        return False
    await db.delete(admin)
    await db.flush()
    return True


async def update_last_login(db: AsyncSession, admin_id: int) -> None:
    admin = await get_admin_by_id(db, admin_id)
    if admin:
        admin.last_login = datetime.now(timezone.utc)
        await db.flush()


async def authenticate_admin(db: AsyncSession, username: str, password: str) -> Admin | None:
    admin = await get_admin_by_username(db, username)
    if admin is None:
        admin = await get_admin_by_email(db, username)
    if admin is None or not admin.is_active:
        return None
    if not verify_password(password, admin.password_hash):
        return None
    return admin
