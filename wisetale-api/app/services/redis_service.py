"""
Redis Service Utility
Usage:
    from app.services.redis_service import get_redis_client
    redis = get_redis_client()
    redis.set('key', 'value')
    value = redis.get('key')
"""
import os
import redis
from dotenv import load_dotenv

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

def get_redis_client():
    return redis.Redis.from_url(REDIS_URL, decode_responses=True) 