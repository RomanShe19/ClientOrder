"""
AdminConfig model — конфигурация для фронтенда и админки.

DDL (fallback):
    CREATE TABLE IF NOT EXISTS admin_configs (
        id            SERIAL PRIMARY KEY,
        config_key    VARCHAR(255) NOT NULL UNIQUE,
        config_value  JSONB NOT NULL DEFAULT '{}',
        description   VARCHAR(500),
        is_active     BOOLEAN NOT NULL DEFAULT TRUE,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE UNIQUE INDEX IF NOT EXISTS ix_admin_configs_config_key ON admin_configs(config_key);
"""

from datetime import datetime
from typing import Any

from sqlalchemy import Boolean, DateTime, Integer, String, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class AdminConfig(Base):
    __tablename__ = "admin_configs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    config_key: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    config_value: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, server_default="{}")
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default="true")

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
