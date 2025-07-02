"""
Redis Service Utility
Usage:
    from app.services.redis_service import get_redis_client
    redis = get_redis_client()
    if redis:
        redis.set('key', 'value')
        value = redis.get('key')
"""
import os
import redis
from dotenv import load_dotenv
import logging

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
logger = logging.getLogger(__name__)

def get_redis_client():
    """Get Redis client, returns None if Redis is unavailable"""
    try:
        client = redis.Redis.from_url(REDIS_URL, decode_responses=True)
        # Test connection
        client.ping()  # type: ignore
        return client
    except Exception as e:
        logger.warning(f"Redis unavailable, running without cache: {e}")
        return None 