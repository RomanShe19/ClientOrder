from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class LeadBase(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    middle_name: str | None = None
    contact_phone: str = Field(..., min_length=5, max_length=30)
    contact_email: EmailStr | None = None
    business_niche: str = Field(..., max_length=255)
    company_size: str = Field(..., max_length=100)
    task_volume: str = Field(..., max_length=255)
    client_role: str = Field(..., max_length=100)
    budget: str = Field(..., max_length=100)
    preferred_contact_method: str = Field(..., max_length=100)
    preferred_contact_time: str = Field(..., max_length=100)
    product_interest: str = Field(..., max_length=255)
    task_type: str = Field(..., max_length=255)
    result_deadline: str = Field(..., max_length=255)
    comments: str | None = None


class LeadCreate(LeadBase):
    pass


class LeadUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    middle_name: str | None = None
    contact_phone: str | None = Field(None, min_length=5, max_length=30)
    contact_email: EmailStr | None = None
    business_niche: str | None = Field(None, max_length=255)
    company_size: str | None = Field(None, max_length=100)
    task_volume: str | None = Field(None, max_length=255)
    client_role: str | None = Field(None, max_length=100)
    budget: str | None = Field(None, max_length=100)
    preferred_contact_method: str | None = Field(None, max_length=100)
    preferred_contact_time: str | None = Field(None, max_length=100)
    product_interest: str | None = Field(None, max_length=255)
    task_type: str | None = Field(None, max_length=255)
    result_deadline: str | None = Field(None, max_length=255)
    comments: str | None = None


class LeadResponse(LeadBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
