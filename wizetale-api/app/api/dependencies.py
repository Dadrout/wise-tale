from typing import Annotated, Optional
from fastapi import Depends, HTTPException, Security, status, Request
from fastapi.security import APIKeyHeader, HTTPBearer
from fastapi.security.api_key import APIKeyHeader
from app.core.config import settings
import os
import logging

logger = logging.getLogger(__name__)

# API key security scheme
API_KEY_HEADER = APIKeyHeader(name="X-API-KEY", auto_error=False)

async def verify_api_key(request: Request, api_key: str = Security(API_KEY_HEADER)):
    # Log all incoming headers for debugging purposes
    logger.info(f"Incoming request headers: {request.headers}")
    if not api_key:
        logger.error("API key is missing from request.")
        raise HTTPException(status_code=403, detail="Missing API key")
    if api_key != settings.API_KEY:
        logger.error(f"Invalid API key provided. Got: '{api_key[:5]}...'")
        raise HTTPException(status_code=403, detail="Invalid API key")
    return api_key

# Bearer token security scheme for user authentication
oauth2_scheme = HTTPBearer()

async def get_current_user(request: Request):
    from app.services.firebase_service import firebase_service
    # This is a placeholder for actual user authentication
    # You would typically decode a JWT here or verify a session token
    # For now, we'll just return a dummy user object
    return {"user_id": "test_user_123", "email": "test@example.com"} 