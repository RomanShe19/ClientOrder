"""
Lead model — клиентская заявка.

DDL (fallback):
    CREATE TABLE IF NOT EXISTS leads (
        id            SERIAL PRIMARY KEY,
        first_name    VARCHAR(100),
        last_name     VARCHAR(100),
        middle_name   VARCHAR(100),
        contact_phone VARCHAR(30) NOT NULL,
        contact_email VARCHAR(255),
        business_niche          VARCHAR(255) NOT NULL,
        company_size            VARCHAR(100) NOT NULL,
        task_volume             VARCHAR(255) NOT NULL,
        client_role             VARCHAR(100) NOT NULL,
        budget                  VARCHAR(100) NOT NULL,
        preferred_contact_method VARCHAR(100) NOT NULL,
        preferred_contact_time  VARCHAR(100) NOT NULL,
        product_interest        VARCHAR(255) NOT NULL,
        task_type               VARCHAR(255) NOT NULL,
        result_deadline         VARCHAR(255) NOT NULL,
        comments      TEXT,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
"""

from datetime import datetime

from sqlalchemy import DateTime, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Lead(Base):
    __tablename__ = "leads"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    first_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    last_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    middle_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    contact_phone: Mapped[str] = mapped_column(String(30), nullable=False)
    contact_email: Mapped[str | None] = mapped_column(String(255), nullable=True)

    business_niche: Mapped[str] = mapped_column(String(255), nullable=False)
    company_size: Mapped[str] = mapped_column(String(100), nullable=False)
    task_volume: Mapped[str] = mapped_column(String(255), nullable=False)
    client_role: Mapped[str] = mapped_column(String(100), nullable=False)
    budget: Mapped[str] = mapped_column(String(100), nullable=False)
    preferred_contact_method: Mapped[str] = mapped_column(String(100), nullable=False)
    preferred_contact_time: Mapped[str] = mapped_column(String(100), nullable=False)
    product_interest: Mapped[str] = mapped_column(String(255), nullable=False)
    task_type: Mapped[str] = mapped_column(String(255), nullable=False)
    result_deadline: Mapped[str] = mapped_column(String(255), nullable=False)
    comments: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    analytics: Mapped["Analytics | None"] = relationship(  # noqa: F821
        "Analytics", back_populates="lead", uselist=False, cascade="all, delete-orphan"
    )
