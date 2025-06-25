from fastapi import APIRouter, HTTPException
from app.schemas.story import Story, StoryCreate, StoryUpdate
from app.services.supabase_service import get_supabase_client
from typing import List

router = APIRouter(prefix="/stories", tags=["stories"])
supabase = get_supabase_client()

@router.get("/", response_model=List[Story])
def get_stories():
    resp = supabase.table("stories").select("*").execute()
    if resp.error:
        raise HTTPException(status_code=500, detail=resp.error.message)
    return resp.data

@router.get("/{story_id}", response_model=Story)
def get_story(story_id: int):
    resp = supabase.table("stories").select("*").eq("id", story_id).single().execute()
    if resp.error or not resp.data:
        raise HTTPException(status_code=404, detail="Story not found")
    return resp.data

@router.post("/", response_model=Story)
def create_story(story: StoryCreate):
    resp = supabase.table("stories").insert(story.dict()).single().execute()
    if resp.error:
        raise HTTPException(status_code=400, detail=resp.error.message)
    return resp.data

@router.put("/{story_id}", response_model=Story)
def update_story(story_id: int, story: StoryUpdate):
    resp = supabase.table("stories").update(story.dict(exclude_unset=True)).eq("id", story_id).single().execute()
    if resp.error or not resp.data:
        raise HTTPException(status_code=404, detail="Story not found or update failed")
    return resp.data

@router.delete("/{story_id}")
def delete_story(story_id: int):
    resp = supabase.table("stories").delete().eq("id", story_id).single().execute()
    if resp.error:
        raise HTTPException(status_code=404, detail="Story not found or delete failed")
    return {"message": f"Story {story_id} deleted"} 