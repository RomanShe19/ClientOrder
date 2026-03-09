from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.database import create_tables
from app.routes import admin, admin_panel, analytics, auth, lead, session_tracking

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_tables()
    yield


app = FastAPI(
    title="AutoVIP API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(lead.router)
app.include_router(analytics.router)
app.include_router(session_tracking.router)
app.include_router(admin.router)
app.include_router(auth.router)
app.include_router(admin_panel.router)


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "autovip-backend"}
