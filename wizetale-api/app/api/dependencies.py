from typing import Annotated, Optional
from fastapi import Depends, HTTPException, Security, status, Request
from fastapi.security import APIKeyHeader, HTTPBearer
from fastapi.security.api_key import APIKeyHeader
from app.services.firebase_service import firebase_service
from app.core.config import settings
import os
import logging

logger = logging.getLogger(__name__)

# API key security scheme
API_KEY_HEADER = APIKeyHeader(name="x-api-key", auto_error=False)

async def verify_api_key(request: Request, api_key: str = Security(API_KEY_HEADER)):
    logger.info(f"Incoming request headers: {request.headers}")
    # Only enforce in production
    if settings.ENVIRONMENT != "production":
        return "development"
    
    if not api_key:
        logger.error("API key is missing from request.")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Missing API key"
        )
    
    expected_key = os.getenv("API_KEY")
    
    if not expected_key or api_key != expected_key:
        logger.error(f"Invalid API key provided. Got: '{api_key[:5]}...'")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid API key"
        )
    
    return api_key

# Bearer token security scheme for user authentication
oauth2_scheme = HTTPBearer()

async def get_current_user(request: Request):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # The token is the Firebase ID token
        user = firebase_service.verify_id_token(request.headers.get("Authorization").replace("Bearer ", ""))
        return user
    except ValueError:
        raise credentials_exception
    except Exception:
        raise credentials_exception 