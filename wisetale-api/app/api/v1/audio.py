from fastapi import APIRouter, HTTPException
from app.schemas.media import Media, MediaCreate, MediaUpdate
from app.services.supabase_service import get_supabase_client
from typing import List

router = APIRouter(prefix="/audio", tags=["audio"])
supabase = get_supabase_client()

def _audio_filter():
    return {"type": "audio"}

@router.get("/", response_model=List[Media])
def get_audio_files():
    resp = supabase.table("media").select("*").eq("type", "audio").execute()
    if resp.error:
        raise HTTPException(status_code=500, detail=resp.error.message)
    return resp.data

@router.get("/{audio_id}", response_model=Media)
def get_audio(audio_id: int):
    resp = supabase.table("media").select("*").eq("id", audio_id).eq("type", "audio").single().execute()
    if resp.error or not resp.data:
        raise HTTPException(status_code=404, detail="Audio not found")
    return resp.data

@router.post("/", response_model=Media)
def create_audio(media: MediaCreate):
    if media.type != "audio":
        raise HTTPException(status_code=400, detail="Invalid media type for this endpoint")
    resp = supabase.table("media").insert(media.dict()).single().execute()
    if resp.error:
        raise HTTPException(status_code=400, detail=resp.error.message)
    return resp.data

@router.put("/{audio_id}", response_model=Media)
def update_audio(audio_id: int, media: MediaUpdate):
    resp = supabase.table("media").update(media.dict(exclude_unset=True)).eq("id", audio_id).eq("type", "audio").single().execute()
    if resp.error or not resp.data:
        raise HTTPException(status_code=404, detail="Audio not found or update failed")
    return resp.data

@router.delete("/{audio_id}")
def delete_audio(audio_id: int):
    resp = supabase.table("media").delete().eq("id", audio_id).eq("type", "audio").single().execute()
    if resp.error:
        raise HTTPException(status_code=404, detail="Audio not found or delete failed")
    return {"message": f"Audio {audio_id} deleted"} 