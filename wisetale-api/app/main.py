# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.api.v1.generate import router as generate_router

app = FastAPI(
    title="WiseTale API",
    description="AI-powered educational video generation",
    version="1.0.0"
)

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
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

# Include routers
app.include_router(generate_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "WiseTale API is running!", "version": "1.0.0"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
