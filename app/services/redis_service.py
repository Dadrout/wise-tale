import json
from typing import Any, Optional
from redis import Redis
from app.core.config import get_settings

settings = get_settings()

class RedisService:
    def __init__(self):
        self.redis_client = Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            db=settings.REDIS_DB,
            password=settings.REDIS_PASSWORD,
            decode_responses=True
        )
        
    async def get_cache(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        try:
            data = self.redis_client.get(key)
            return json.loads(data) if data else None
        except Exception as e:
            print(f"Redis get error: {e}")
            return None
            
    async def set_cache(self, key: str, value: Any, expire_seconds: int = 3600) -> bool:
        """Set value in cache with expiration"""
        try:
            return self.redis_client.setex(
                key,
                expire_seconds,
                json.dumps(value)
            )
        except Exception as e:
            print(f"Redis set error: {e}")
            return False
            
    async def delete_cache(self, key: str) -> bool:
        """Delete value from cache"""
        try:
            return bool(self.redis_client.delete(key))
        except Exception as e:
            print(f"Redis delete error: {e}")
            return False
            
    async def clear_pattern(self, pattern: str) -> bool:
        """Clear all keys matching pattern"""
        try:
            keys = self.redis_client.keys(pattern)
            if keys:
                return bool(self.redis_client.delete(*keys))
            return True
        except Exception as e:
            print(f"Redis clear pattern error: {e}")
            return False

# Global Redis instance
redis_service = RedisService() 