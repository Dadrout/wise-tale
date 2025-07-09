from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.services.firebase_service import firebase_service

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token") # tokenUrl is not used, but required

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