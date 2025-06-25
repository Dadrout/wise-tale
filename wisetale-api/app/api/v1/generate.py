from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from uuid import uuid4
from app.services.supabase_service import get_supabase_client
from app.services.redis_service import get_redis_client
from datetime import datetime
import hashlib

router = APIRouter(prefix="/generate", tags=["generate"])
supabase = get_supabase_client()
redis = get_redis_client()

class GenerateRequest(BaseModel):
    text: str
    user_id: int
    persona: str = "default"

class GenerateResponse(BaseModel):
    id: int
    url: str
    created_at: datetime

@router.post("/", response_model=GenerateResponse)
def generate_video(req: GenerateRequest):
    # Hash prompt+persona for cache key
    cache_key = f"generate:{hashlib.sha256((req.text + req.persona).encode()).hexdigest()}"
    cached = redis.get(cache_key)
    if cached:
        # Return cached result (as stringified dict)
        import json
        data = json.loads(cached)
        return GenerateResponse(**data)
    # Not cached: generate fake video
    fake_url = f"https://mock.video/{uuid4()}"
    now = datetime.utcnow().isoformat()
    insert_data = {
        "type": "video",
        "url": fake_url,
        "user_id": req.user_id,
        "story_id": None,
        "created_at": now,
        "updated_at": now,
    }
    resp = supabase.table("media").insert(insert_data).single().execute()
    if resp.error:
        raise HTTPException(status_code=500, detail=resp.error.message)
    result = GenerateResponse(id=resp.data["id"], url=resp.data["url"], created_at=resp.data["created_at"])
    # Cache the result
    redis.set(cache_key, result.model_dump_json(), ex=60*60*24)  # 24h TTL
    return result 