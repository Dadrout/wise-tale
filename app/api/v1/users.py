from fastapi import APIRouter, HTTPException
from app.services.redis_service import redis_service
from app.services.supabase_service import supabase_service

router = APIRouter()

@router.get("/{user_id}")
async def get_user(user_id: str):
    # Try to get from cache first
    cache_key = f"user:{user_id}"
    cached_user = await redis_service.get_cache(cache_key)
    
    if cached_user:
        return cached_user
        
    # If not in cache, get from database
    user = await supabase_service.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Store in cache for future requests
    await redis_service.set_cache(cache_key, user, expire_seconds=3600)
    return user 