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
import redis.asyncio as redis
from dotenv import load_dotenv
import logging

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
logger = logging.getLogger(__name__)

async def get_redis_client():
    """Get Redis client, returns None if Redis is unavailable"""
    try:
        client = redis.Redis.from_url(REDIS_URL, decode_responses=True)
        # Test connection
        await client.ping()
        return client
    except Exception as e:
        logger.warning(f"Redis unavailable, running without cache: {e}")
        return None 