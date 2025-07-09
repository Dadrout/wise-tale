import os
from typing import Optional
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    """
    Application Settings using Pydantic BaseSettings.
    Loads variables from .env file and environment.
    """
    # Stability AI API for image generation
    STABILITY_API_KEY: Optional[str] = None

    # Pexels API Key for image search fallback
    PEXELS_API_KEY: Optional[str] = None

    # Azure OpenAI (for story text generation)
    AZURE_OPENAI_ENDPOINT: Optional[str] = None
    AZURE_OPENAI_API_KEY: Optional[str] = None
    AZURE_OPENAI_API_VERSION: Optional[str] = None
    AZURE_OPENAI_DEPLOYMENT_NAME: Optional[str] = None

    # Azure Speech (for audio generation)
    AZURE_SPEECH_KEY: Optional[str] = None
    AZURE_SPEECH_REGION: Optional[str] = None

    # Redis URL for Celery broker and cache
    # Use different DB numbers for broker and results backend, e.g., /0 and /1
    REDIS_URL: str = "redis://redis:6379/0"

    # Firebase Service Account
    # This should be the full JSON string, not a path to the file.
    GOOGLE_APPLICATION_CREDENTIALS_PATH: Optional[str] = None
    FIREBASE_STORAGE_BUCKET: Optional[str] = None

    # Default values
    DEFAULT_PERSONA: str = "narrator"
    DEFAULT_LANGUAGE: str = "en"
    TARGET_LANGUAGE: str = "en"
    RUNWARE_API_KEY: Optional[str] = None

    class Config:
        case_sensitive = True

# Create a single instance of the settings
settings = Settings() 