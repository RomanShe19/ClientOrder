"""
SessionTracking model — real-time anonymous session data for heatmaps and behavior analysis.

DDL (fallback):
    CREATE TABLE IF NOT EXISTS session_tracking (
        id                  SERIAL PRIMARY KEY,
        session_id          VARCHAR(64) NOT NULL UNIQUE,
        page_time_seconds   INTEGER NOT NULL DEFAULT 0,
        button_clicks       JSONB NOT NULL DEFAULT '{}',
        cursor_positions    JSONB NOT NULL DEFAULT '[]',
        cursor_heatmap      JSONB NOT NULL DEFAULT '{}',
        session_data        JSONB NOT NULL DEFAULT '{}',
        lead_id             INTEGER REFERENCES leads(id) ON DELETE SET NULL,
        created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE UNIQUE INDEX IF NOT EXISTS ix_session_tracking_session_id
        ON session_tracking(session_id);
"""

from datetime import datetime
from typing import Any

from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class SessionTracking(Base):
    __tablename__ = "session_tracking"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id: Mapped[str] = mapped_column(
        String(64), unique=True, nullable=False, index=True
    )

    page_time_seconds: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    button_clicks: Mapped[dict[str, Any]] = mapped_column(
        JSONB, nullable=False, server_default="{}"
    )
    cursor_positions: Mapped[list[Any]] = mapped_column(
        JSONB, nullable=False, server_default="[]"
    )
    cursor_heatmap: Mapped[dict[str, Any]] = mapped_column(
        JSONB, nullable=False, server_default="{}"
    )
    session_data: Mapped[dict[str, Any]] = mapped_column(
        JSONB, nullable=False, server_default="{}"
    )

    lead_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("leads.id", ondelete="SET NULL"), nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
