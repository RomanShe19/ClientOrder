from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class AdminConfigBase(BaseModel):
    config_key: str = Field(..., max_length=255)
    config_value: dict[str, Any] = Field(default_factory=dict)
    description: str | None = Field(None, max_length=500)
    is_active: bool = True


class AdminConfigCreate(AdminConfigBase):
    pass


class AdminConfigUpdate(BaseModel):
    config_key: str | None = Field(None, max_length=255)
    config_value: dict[str, Any] | None = None
    description: str | None = Field(None, max_length=500)
    is_active: bool | None = None


class AdminConfigResponse(AdminConfigBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
