from typing import Annotated, Optional
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.services.firebase_service import firebase_service
from app.core.config import settings
import os

# Bearer token security scheme
security = HTTPBearer(auto_error=False)

async def verify_api_key(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security)
) -> str:
    """
    Verify API key for production endpoints
    """
    # Only enforce in production
    if settings.ENVIRONMENT != "production":
        return "development"
    
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Missing API key"
        )
    
    api_key = credentials.credentials
    expected_key = os.getenv("API_KEY")
    
    if not expected_key or api_key != expected_key:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid API key"
        )
    
    return api_key

oauth2_scheme = HTTPBearer() # tokenUrl is not used, but required

async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # The token is the Firebase ID token
        user = firebase_service.verify_id_token(token)
        return user
    except ValueError:
        raise credentials_exception
    except Exception:
        raise credentials_exception 