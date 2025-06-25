"""
Pydantic schema for Story
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Story(BaseModel):
    id: Optional[int]
    title: str
    content: str
    user_id: int
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

class StoryCreate(BaseModel):
    title: str
    content: str
    user_id: int

class StoryUpdate(BaseModel):
    title: Optional[str]
    content: Optional[str] 