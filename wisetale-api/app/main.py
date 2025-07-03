# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import os

# Import all routers
from app.api.v1.generate import router as generate_router
from app.api.v1.users import router as users_router
from app.api.v1.stories import router as stories_router
from app.api.v1.videos import router as videos_router
from app.api.v1.audio import router as audio_router
from app.api.v1.waitlist import router as waitlist_router

app = FastAPI(
    title="WiseTale API",
    description="AI-powered educational video generation",
    version="1.0.0"
)

# CORS settings - secure for production
environment = os.getenv("ENVIRONMENT", "development")
if environment == "production":
    # Production - specific origins only
    origins = [
        "https://yourdomain.com",  # Replace with your actual domain
        "https://www.yourdomain.com",  # Replace with your actual domain
        "https://app.yourdomain.com",  # Replace with your actual domain
    ]
else:
    # Development - allow local origins
    origins = [
        "http://localhost:3000",  # Landing page
        "http://localhost:3001",  # Main app
        "http://localhost:8000",  # API docs
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Create directories if they don't exist
videos_dir = Path("generated_videos")
videos_dir.mkdir(exist_ok=True)

audio_dir = Path("generated_audio")
audio_dir.mkdir(exist_ok=True)

# Mount static files for video and audio serving
app.mount("/videos", StaticFiles(directory=str(videos_dir)), name="videos")
app.mount("/audio", StaticFiles(directory=str(audio_dir)), name="audio")

# Include all routers
app.include_router(generate_router, prefix="/api/v1")
app.include_router(users_router, prefix="/api/v1")
app.include_router(stories_router, prefix="/api/v1")
app.include_router(videos_router, prefix="/api/v1")
app.include_router(audio_router, prefix="/api/v1")
app.include_router(waitlist_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "WiseTale API is running!", "version": "1.0.0"}

@app.get("/health")
async def health():
    return {"status": "healthy", "environment": environment}

@app.get("/api/v1/docs")
async def api_docs():
    return {"message": "API documentation available at /docs"}
