from enum import Enum
from datetime import datetime
from typing import Optional, Any, Dict
from pydantic import BaseModel


class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"


class TaskBase(BaseModel):
    subject: str
    topic: str
    level: str = "beginner"
    language: str = "en-US"
    voice: str = "female"  # Add voice field with default value
    user_id: Optional[str] = None  # Changed from int to str for Firebase UID


class TaskCreate(TaskBase):
    pass


class TaskResponse(BaseModel):
    task_id: str
    status: TaskStatus
    message: str
    created_at: datetime
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class TaskStatusResponse(BaseModel):
    task_id: str
    status: TaskStatus
    progress: int  # 0-100
    message: str
    created_at: datetime
    updated_at: datetime
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class TaskResult(BaseModel):
    task_id: str
    video_url: str
    audio_url: str
    script: str
    duration: float
    created_at: datetime
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        } 