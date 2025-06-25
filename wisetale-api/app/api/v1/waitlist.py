"""
Waitlist API endpoints
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from app.services.supabase_service import get_supabase_client
from datetime import datetime

router = APIRouter(prefix="/waitlist", tags=["waitlist"])
supabase = get_supabase_client()

class WaitlistRequest(BaseModel):
    email: EmailStr
    name: str = None

class WaitlistResponse(BaseModel):
    message: str
    email: str

@router.post("/", response_model=WaitlistResponse)
def add_to_waitlist(req: WaitlistRequest):
    try:
        # Insert into waitlist table
        insert_data = {
            "email": req.email,
            "name": req.name,
            "created_at": datetime.utcnow().isoformat()
        }
        resp = supabase.table("waitlist").insert(insert_data).single().execute()
        
        if resp.error:
            if "duplicate key" in resp.error.message.lower():
                raise HTTPException(status_code=400, detail="Email already registered")
            raise HTTPException(status_code=500, detail=resp.error.message)
        
        return WaitlistResponse(
            message="Successfully added to waitlist!",
            email=req.email
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 