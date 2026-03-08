from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class AnalyticsBase(BaseModel):
    lead_id: int
    page_time_seconds: int = Field(0, ge=0)
    button_clicks: dict[str, Any] = Field(default_factory=dict)
    cursor_heatmap: dict[str, Any] = Field(default_factory=dict)
    return_visits: int = Field(0, ge=0)
    session_data: dict[str, Any] = Field(default_factory=dict)


class AnalyticsCreate(AnalyticsBase):
    pass


class AnalyticsUpdate(BaseModel):
    page_time_seconds: int | None = Field(None, ge=0)
    button_clicks: dict[str, Any] | None = None
    cursor_heatmap: dict[str, Any] | None = None
    return_visits: int | None = Field(None, ge=0)
    session_data: dict[str, Any] | None = None


class AnalyticsResponse(AnalyticsBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
