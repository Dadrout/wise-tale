import logging
import os
import re
import asyncio
import firebase_admin
from firebase_admin import credentials
from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, StreamingResponse, JSONResponse
from pathlib import Path
from celery.result import AsyncResult
from slowapi import Limiter
from slowapi.util import get_remote_address

# Load environment variables from .env file
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

# Initialize Firebase Admin SDK
try:
    cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS_PATH")
    bucket_name = os.getenv("FIREBASE_STORAGE_BUCKET")
    
    if cred_path and bucket_name:
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred, {'storageBucket': bucket_name})
        logging.info("✅ Firebase Admin SDK initialized successfully.")
    else:
        logging.warning("⚠️ Firebase credentials not found. Firebase services will be disabled.")
except Exception as e:
    logging.error(f"❌ Failed to initialize Firebase Admin SDK: {e}", exc_info=True)

# Import other components after Firebase is initialized
from app.core.config import settings
from app.api.v1 import generate
from app.celery_utils import celery_app

# Initialize Limiter
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Wizetale API",
    description="AI-powered educational video generation",
    version="1.0.0"
)

app.state.limiter = limiter

# CORS settings
environment = os.getenv("ENVIRONMENT", "development")
origins = [
    "https://wizetale.com",
    "https://www.wizetale.com",
    "https://wizetale.vercel.app",
]
if environment == "development":
    origins.append("*")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*", "X-API-Key"],
)

# Static files setup
static_dir = Path("static")
static_dir.mkdir(exist_ok=True)
app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

# Mount directories for generated files
generated_videos_dir = Path("generated_videos")
generated_videos_dir.mkdir(exist_ok=True)
app.mount("/generated_videos", StaticFiles(directory=str(generated_videos_dir)), name="generated_videos")

generated_audio_dir = Path("generated_audio")
generated_audio_dir.mkdir(exist_ok=True)
app.mount("/generated_audio", StaticFiles(directory=str(generated_audio_dir)), name="generated_audio")

generated_images_dir = Path("generated_images")
generated_images_dir.mkdir(exist_ok=True)
app.mount("/generated_images", StaticFiles(directory=str(generated_images_dir)), name="generated_images")

@app.get("/static/{user_id}/{video_name}")
async def serve_video(user_id: str, video_name: str, range: str = Header(None)):
    video_path = static_dir / user_id / video_name
    if not video_path.is_file():
        return JSONResponse(content={"error": "Video not found"}, status_code=404)
    
    file_size = video_path.stat().st_size
    range_header = range
    
    if range_header:
        range_match = re.match(r'bytes=(\d+)-(\d*)', range_header)
        if range_match:
            start = int(range_match.group(1))
            end = int(range_match.group(2)) if range_match.group(2) else file_size - 1
            end = min(end, file_size - 1)
            content_length = end - start + 1
            
            def generate_video_chunk():
                with open(video_path, 'rb') as video_file:
                    video_file.seek(start)
                    remaining = content_length
                    while remaining > 0:
                        chunk_size = min(8192, remaining)
                        chunk = video_file.read(chunk_size)
                        if not chunk: break
                        remaining -= len(chunk)
                        yield chunk
            
            headers = {
                'Content-Range': f'bytes {start}-{end}/{file_size}',
                'Accept-Ranges': 'bytes',
                'Content-Length': str(content_length),
                'Content-Type': 'video/mp4',
            }
            return StreamingResponse(generate_video_chunk(), status_code=206, headers=headers)
            
    return FileResponse(video_path, media_type="video/mp4", headers={"Accept-Ranges": "bytes"})

# Include API routers
app.include_router(generate.router, prefix="/api/v1")

@app.get("/ping", status_code=200)
async def ping():
    return {"status": "pong"}

@app.get("/health", status_code=200)
async def health_check():
    return {"status": "ok"}

@app.websocket("/ws/status/{task_id}")
async def websocket_endpoint(websocket: WebSocket, task_id: str):
    await websocket.accept()
    task_result = AsyncResult(task_id, app=celery_app)
    
    try:
        while not task_result.ready():
            await websocket.send_json({"task_id": task_id, "status": task_result.status, "info": task_result.info})
            await asyncio.sleep(1)
            task_result = AsyncResult(task_id, app=celery_app)
        
        await websocket.send_json({"task_id": task_id, "status": task_result.status, "info": task_result.info})
    except WebSocketDisconnect:
        logging.info(f"Client disconnected from task {task_id}")
    finally:
        await websocket.close() 