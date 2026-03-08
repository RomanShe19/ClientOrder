"""
Analytics model — поведение пользователя на странице.

DDL (fallback):
    CREATE TABLE IF NOT EXISTS analytics (
        id                  SERIAL PRIMARY KEY,
        lead_id             INTEGER NOT NULL UNIQUE REFERENCES leads(id) ON DELETE CASCADE,
        page_time_seconds   INTEGER NOT NULL DEFAULT 0,
        button_clicks       JSONB DEFAULT '{}',
        cursor_heatmap      JSONB DEFAULT '{}',
        return_visits       INTEGER NOT NULL DEFAULT 0,
        session_data        JSONB DEFAULT '{}',
        created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE UNIQUE INDEX IF NOT EXISTS ix_analytics_lead_id ON analytics(lead_id);
"""

from datetime import datetime
from typing import Any

from sqlalchemy import DateTime, ForeignKey, Integer, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Analytics(Base):
    __tablename__ = "analytics"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    lead_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("leads.id", ondelete="CASCADE"), unique=True, nullable=False
    )

    page_time_seconds: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    button_clicks: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, server_default="{}")
    cursor_heatmap: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, server_default="{}")
    return_visits: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    session_data: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, server_default="{}")

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    lead: Mapped["Lead"] = relationship("Lead", back_populates="analytics")  # noqa: F821
