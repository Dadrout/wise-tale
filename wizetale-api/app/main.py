# app/main.py
import logging
import firebase_admin
from firebase_admin import credentials
import os
from dotenv import load_dotenv

# --- Firebase Initialization ---
# This must be the very first thing that happens
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def initialize_firebase():
    """Initializes the Firebase Admin SDK."""
    if firebase_admin._apps:
        logger.info("Firebase already initialized.")
        return

    try:
        cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS_PATH")
        bucket_name = os.getenv("FIREBASE_STORAGE_BUCKET")

        if not cred_path or not bucket_name:
            logger.warning("Firebase credentials or storage bucket not found in env. Skipping initialization.")
            return

        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred, {'storageBucket': bucket_name})
        logger.info(f"✅ Firebase initialized successfully for bucket: {bucket_name}")

    except Exception as e:
        logger.critical(f"❌ Critical error initializing Firebase: {e}", exc_info=True)
        # We might want to raise an exception here to halt the app if Firebase is essential
        raise

load_dotenv()
initialize_firebase()


# --- Now, we can safely import everything else ---
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, StreamingResponse, JSONResponse
from dotenv import load_dotenv
from pathlib import Path
import asyncio
from celery.result import AsyncResult
import re
import logging
import firebase_admin
from firebase_admin import credentials
from slowapi import Limiter
from slowapi.util import get_remote_address
import redis

# Now that Firebase is initialized, we can import other components
from app.core.config import settings
from app.api.v1 import generate
from app.services.redis_service import get_redis_client
from app.celery_utils import celery_app

# Initialize Limiter
limiter = Limiter(key_func=get_remote_address)

# Инициализируем сервисы
# redis_service = get_redis_client() # <-- REMOVE THIS

app = FastAPI(
    title="Wizetale API",
    description="AI-powered educational video generation",
    version="1.0.0"
)

app.state.limiter = limiter

# CORS settings
# For development, allow all origins to avoid issues with Docker networking.
# For production, this should be a specific list of domains.
environment = os.getenv("ENVIRONMENT", "development")

if environment == "production":
    # Production CORS settings - replace with your actual domains
    origins = [
        "https://wizetale.com",
        "https://www.wizetale.com",
        "https://wizetale.vercel.app",
        "https://wizetale-git-main-wizetale.vercel.app",
        "https://wizetale-git-dev-wizetale.vercel.app"
    ]
else:
    # Development settings
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*", "X-API-Key"],
)

# Create static directory if it doesn't exist for serving generated files
static_dir = Path("static")
static_dir.mkdir(exist_ok=True)


# Mount the static directory to serve generated files
app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

# Custom endpoint for serving videos with range request support (optional, can be simplified)
@app.get("/static/{user_id}/{video_name}")
async def serve_video_dynamic(user_id: str, video_name: str, request: Request):
    video_path = static_dir / user_id / video_name
    if not video_path.is_file():
        return JSONResponse(content={"error": "Video not found"}, status_code=404)
    
    file_size = video_path.stat().st_size
    range_header = request.headers.get('Range')
    
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
                        if not chunk:
                            break
                        remaining -= len(chunk)
                        yield chunk
            
            headers = {
                'Content-Range': f'bytes {start}-{end}/{file_size}',
                'Accept-Ranges': 'bytes',
                'Content-Length': str(content_length),
                'Content-Type': 'video/mp4',
            }
            
            return StreamingResponse(
                generate_video_chunk(),
                status_code=206,
                headers=headers
            )
            
    return FileResponse(
        video_path, 
        media_type="video/mp4", 
        headers={"Accept-Ranges": "bytes"}
    )


# Include active routers
app.include_router(generate.router, prefix="/v1")

@app.get("/healthz", status_code=200)
async def simple_health_check():
    """A simple health check endpoint that doesn't depend on any services."""
    return {"status": "ok"}

@app.get("/")
async def root():
    return {"message": "Wizetale API is running!", "version": "1.0.0"}

@app.get("/health")
async def health(redis: redis.Redis = Depends(get_redis_client)):
    try:
        # Check if Redis is connected
        ping_response = await redis.ping()
        if not ping_response:
            raise Exception("Redis ping failed")

        return JSONResponse(content={"status": "healthy", "redis_connected": True})
    except Exception as e:
        logger.error(f"Health check failed: {e}", exc_info=True)
        return JSONResponse(
            content={"status": "unhealthy", "reason": str(e)}, 
            status_code=503
        )

@app.get("/api/v1/docs")
async def api_docs():
    return {"message": "API documentation available at /docs"}

@app.websocket("/ws/status/{task_id}")
async def websocket_endpoint(websocket: WebSocket, task_id: str):
    await websocket.accept()
    task_result = AsyncResult(task_id, app=celery_app)
    
    try:
        while not task_result.ready():
            await websocket.send_json({
                "task_id": task_id,
                "status": task_result.status,
                "info": task_result.info,
            })
            await asyncio.sleep(1) # Poll every second
            # Re-fetch the result object to get the latest status
            task_result = AsyncResult(task_id, app=celery_app)
        
        # Send the final result
        await websocket.send_json({
            "task_id": task_id,
            "status": task_result.status,
            "info": task_result.info,
        })
    except WebSocketDisconnect:
        print(f"Client disconnected from task {task_id}")
    finally:
        await websocket.close()

@app.get("/api/health")
async def api_health():
    return await health()
