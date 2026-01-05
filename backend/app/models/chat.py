from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime


class ChatMessageCreate(BaseModel):
    content: str
    session_id: Optional[str] = None


class ChatMessageResponse(BaseModel):
    id: str
    session_id: str
    role: str
    content: str
    metadata: Optional[dict] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ChatSessionResponse(BaseModel):
    id: str
    user_id: str
    trip_id: Optional[str] = None
    created_at: datetime
    messages: List[ChatMessageResponse] = []

    class Config:
        from_attributes = True


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    trip_context: Optional[dict] = None


class ChatResponse(BaseModel):
    message: str
    session_id: str
    metadata: Optional[dict] = None
