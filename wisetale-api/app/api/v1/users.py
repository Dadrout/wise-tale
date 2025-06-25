from fastapi import APIRouter, HTTPException
from app.schemas.user import User, UserCreate, UserUpdate
from app.services.supabase_service import get_supabase_client
from typing import List

router = APIRouter(prefix="/users", tags=["users"])
supabase = get_supabase_client()

@router.get("/", response_model=List[User])
def get_users():
    resp = supabase.table("users").select("*").execute()
    if resp.error:
        raise HTTPException(status_code=500, detail=resp.error.message)
    return resp.data

@router.get("/{user_id}", response_model=User)
def get_user(user_id: int):
    resp = supabase.table("users").select("*").eq("id", user_id).single().execute()
    if resp.error or not resp.data:
        raise HTTPException(status_code=404, detail="User not found")
    return resp.data

@router.post("/", response_model=User)
def create_user(user: UserCreate):
    resp = supabase.table("users").insert(user.dict()).single().execute()
    if resp.error:
        raise HTTPException(status_code=400, detail=resp.error.message)
    return resp.data

@router.put("/{user_id}", response_model=User)
def update_user(user_id: int, user: UserUpdate):
    resp = supabase.table("users").update(user.dict(exclude_unset=True)).eq("id", user_id).single().execute()
    if resp.error or not resp.data:
        raise HTTPException(status_code=404, detail="User not found or update failed")
    return resp.data

@router.delete("/{user_id}")
def delete_user(user_id: int):
    resp = supabase.table("users").delete().eq("id", user_id).single().execute()
    if resp.error:
        raise HTTPException(status_code=404, detail="User not found or delete failed")
    return {"message": f"User {user_id} deleted"} 