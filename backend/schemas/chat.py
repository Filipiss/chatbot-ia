from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ChatMessageBase(BaseModel):
    role: str = Field(..., description="'user', 'assistant', or 'system'")
    content: str = Field(..., description="Text content of the message")

class ChatMessageCreate(ChatMessageBase):
    pass

class ChatMessageResponse(ChatMessageBase):
    id: int
    session_id: int
    provider: Optional[str] = None
    model_used: Optional[str] = None
    latency: Optional[float] = None
    tokens_used: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ChatSessionBase(BaseModel):
    name: str = Field(..., description="Session title/name")

class ChatSessionCreate(ChatSessionBase):
    pass

class ChatSessionUpdate(BaseModel):
    name: str = Field(..., description="Novo nome da sessão")

class ChatSessionResponse(ChatSessionBase):
    id: int
    created_at: datetime
    updated_at: datetime
    messages: List[ChatMessageResponse] = []

    class Config:
        from_attributes = True
