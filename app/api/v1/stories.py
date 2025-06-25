from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from app.services.redis_service import redis_service
from app.services.supabase_service import supabase_service

router = APIRouter()

@router.get("/{story_id}")
async def get_story(story_id: str):
    # Try to get from cache first
    cache_key = f"story:{story_id}"
    cached_story = await redis_service.get_cache(cache_key)
    
    if cached_story:
        return cached_story
        
    # If not in cache, get from database
    story = await supabase_service.get_story(story_id)
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
        
    # Store in cache for future requests
    await redis_service.set_cache(cache_key, story, expire_seconds=3600)
    return story

@router.post("/")
async def create_story(story_data: dict):
    # Create story in database
    story = await supabase_service.create_story(story_data)
    if not story:
        raise HTTPException(status_code=400, detail="Failed to create story")
        
    # Cache the new story
    cache_key = f"story:{story['id']}"
    await redis_service.set_cache(cache_key, story, expire_seconds=3600)
    return story 