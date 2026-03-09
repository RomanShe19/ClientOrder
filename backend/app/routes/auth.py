from fastapi import APIRouter, Depends, HTTPException, Response, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.database import get_db
from app.core.security import (
    blacklist_token,
    create_access_token,
    create_refresh_token,
    get_current_admin,
    verify_token,
)
from app.crud import admin_user as admin_crud
from app.schemas.auth import (
    AdminMeResponse,
    AuthResponse,
    LoginRequest,
    RegisterRequest,
    RegistrationAvailableResponse,
)

settings = get_settings()
router = APIRouter(prefix="/v1/auth", tags=["auth"])


def _set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite="strict",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite="strict",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        path="/",
    )


def _clear_auth_cookies(response: Response) -> None:
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")


def _build_token_payload(admin) -> dict:  # type: ignore[no-untyped-def]
    return {"sub": str(admin.id), "username": admin.username, "role": admin.role}


@router.get("/registration-available", response_model=RegistrationAvailableResponse)
async def registration_available(db: AsyncSession = Depends(get_db)):
    """Check if first admin registration is available (0 admins in DB)."""
    count = await admin_crud.get_admin_count(db)
    return RegistrationAvailableResponse(available=count == 0)


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(data: RegisterRequest, response: Response, db: AsyncSession = Depends(get_db)):
    """Register the first admin. Only works when there are 0 admins in the database."""
    count = await admin_crud.get_admin_count(db)
    if count > 0:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Registration is closed. Admins already exist.",
        )

    existing = await admin_crud.get_admin_by_username(db, data.username)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already taken")

    existing = await admin_crud.get_admin_by_email(db, data.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    from app.schemas.admin_user import AdminCreate
    admin = await admin_crud.create_admin(
        db,
        AdminCreate(username=data.username, email=data.email, password=data.password, role="superadmin"),
    )
    await admin_crud.update_last_login(db, admin.id)
    await db.refresh(admin)

    payload = _build_token_payload(admin)
    access_token = create_access_token(payload)
    refresh_token = create_refresh_token(payload)
    _set_auth_cookies(response, access_token, refresh_token)

    return AuthResponse(
        message="Registration successful",
        admin=AdminMeResponse.model_validate(admin),
    )


@router.post("/login", response_model=AuthResponse)
async def login(data: LoginRequest, response: Response, db: AsyncSession = Depends(get_db)):
    """Authenticate admin and issue JWT tokens via HttpOnly cookies."""
    admin = await admin_crud.authenticate_admin(db, data.username, data.password)
    if not admin:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    await admin_crud.update_last_login(db, admin.id)
    await db.refresh(admin)

    payload = _build_token_payload(admin)
    access_token = create_access_token(payload)
    refresh_token = create_refresh_token(payload)
    _set_auth_cookies(response, access_token, refresh_token)

    return AuthResponse(
        message="Login successful",
        admin=AdminMeResponse.model_validate(admin),
    )


@router.post("/logout", response_model=AuthResponse)
async def logout(request: Request, response: Response):
    """Logout: blacklist tokens and clear cookies."""
    access = request.cookies.get("access_token")
    refresh = request.cookies.get("refresh_token")
    if access:
        blacklist_token(access)
    if refresh:
        blacklist_token(refresh)
    _clear_auth_cookies(response)
    return AuthResponse(message="Logged out successfully")


@router.post("/refresh", response_model=AuthResponse)
async def refresh_token(request: Request, response: Response, db: AsyncSession = Depends(get_db)):
    """Refresh access token using the refresh token cookie."""
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No refresh token")

    payload = verify_token(token, expected_type="refresh")
    admin_id = payload.get("sub")
    if not admin_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    admin = await admin_crud.get_admin_by_id(db, int(admin_id))
    if not admin or not admin.is_active:
        _clear_auth_cookies(response)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Admin not found or inactive")

    blacklist_token(token)

    new_payload = _build_token_payload(admin)
    new_access = create_access_token(new_payload)
    new_refresh = create_refresh_token(new_payload)
    _set_auth_cookies(response, new_access, new_refresh)

    return AuthResponse(
        message="Token refreshed",
        admin=AdminMeResponse.model_validate(admin),
    )


@router.get("/me", response_model=AdminMeResponse)
async def me(admin=Depends(get_current_admin)):
    """Return current authenticated admin's data."""
    return AdminMeResponse.model_validate(admin)
