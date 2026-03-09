from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class CursorPosition(BaseModel):
    x: int
    y: int
    ts: int = Field(description="Timestamp in ms since page load")


class SessionTrackingUpsert(BaseModel):
    session_id: str = Field(..., max_length=64)
    page_time_seconds: int = Field(0, ge=0)
    button_clicks: dict[str, Any] = Field(default_factory=dict)
    cursor_positions: list[CursorPosition] = Field(default_factory=list)
    cursor_heatmap: dict[str, Any] = Field(default_factory=dict)
    session_data: dict[str, Any] = Field(default_factory=dict)
    lead_id: int | None = None


class SessionTrackingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    session_id: str
    page_time_seconds: int
    button_clicks: dict[str, Any]
    cursor_positions: list[Any]
    cursor_heatmap: dict[str, Any]
    session_data: dict[str, Any]
    lead_id: int | None
    created_at: datetime
    updated_at: datetime
