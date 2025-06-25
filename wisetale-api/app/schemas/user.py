"""
Pydantic schema for User
"""
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class User(BaseModel):
    id: Optional[int]
    email: EmailStr
    name: Optional[str]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

class UserCreate(BaseModel):
    email: EmailStr
    name: Optional[str]

class UserUpdate(BaseModel):
    name: Optional[str] 