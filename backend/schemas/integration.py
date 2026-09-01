from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class IntegrationBase(BaseModel):
    provider: str = Field(..., description="Provider name (ozlo, gemini, openai)")
    name: str = Field(..., description="Display name of the integration")
    model_name: str = Field(..., description="Actual model code (e.g. gemini-2.5-flash, gpt-4o-mini)")
    api_key: Optional[str] = Field(None, description="Secret API Key")
    api_url: Optional[str] = Field(None, description="API Endpoint URL (e.g. for custom OpenAI endpoints like Groq)")
    is_active: bool = Field(False, description="Whether this provider is currently active")
    system_instruction: Optional[str] = Field(None, description="Custom base prompting instructions")

class IntegrationCreate(IntegrationBase):
    pass

class IntegrationUpdate(BaseModel):
    provider: Optional[str] = None
    name: Optional[str] = None
    model_name: Optional[str] = None
    api_key: Optional[str] = None
    api_url: Optional[str] = None
    is_active: Optional[bool] = None
    system_instruction: Optional[str] = None

class IntegrationResponse(IntegrationBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
