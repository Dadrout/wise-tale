"""
Pydantic schema for Media (audio/video)
"""
from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime

class Media(BaseModel):
    id: Optional[int]
    type: Literal["audio", "video"]
    url: str
    user_id: int
    story_id: Optional[int]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

class MediaCreate(BaseModel):
    type: Literal["audio", "video"]
    url: str
    user_id: int
    story_id: Optional[int]

class MediaUpdate(BaseModel):
    url: Optional[str] 