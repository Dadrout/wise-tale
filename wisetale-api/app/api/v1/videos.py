from fastapi import APIRouter, HTTPException
from app.schemas.media import Media, MediaCreate, MediaUpdate
from app.services.supabase_service import get_supabase_client
from typing import List

router = APIRouter(prefix="/videos", tags=["videos"])
supabase = get_supabase_client()

def _video_filter():
    return {"type": "video"}

@router.get("/", response_model=List[Media])
def get_videos():
    resp = supabase.table("media").select("*").eq("type", "video").execute()
    if resp.error:
        raise HTTPException(status_code=500, detail=resp.error.message)
    return resp.data

@router.get("/{video_id}", response_model=Media)
def get_video(video_id: int):
    resp = supabase.table("media").select("*").eq("id", video_id).eq("type", "video").single().execute()
    if resp.error or not resp.data:
        raise HTTPException(status_code=404, detail="Video not found")
    return resp.data

@router.post("/", response_model=Media)
def create_video(media: MediaCreate):
    if media.type != "video":
        raise HTTPException(status_code=400, detail="Invalid media type for this endpoint")
    resp = supabase.table("media").insert(media.dict()).single().execute()
    if resp.error:
        raise HTTPException(status_code=400, detail=resp.error.message)
    return resp.data

@router.put("/{video_id}", response_model=Media)
def update_video(video_id: int, media: MediaUpdate):
    resp = supabase.table("media").update(media.dict(exclude_unset=True)).eq("id", video_id).eq("type", "video").single().execute()
    if resp.error or not resp.data:
        raise HTTPException(status_code=404, detail="Video not found or update failed")
    return resp.data

@router.delete("/{video_id}")
def delete_video(video_id: int):
    resp = supabase.table("media").delete().eq("id", video_id).eq("type", "video").single().execute()
    if resp.error:
        raise HTTPException(status_code=404, detail="Video not found or delete failed")
    return {"message": f"Video {video_id} deleted"} 