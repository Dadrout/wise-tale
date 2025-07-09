# app/main.py
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, StreamingResponse
from dotenv import load_dotenv
from pathlib import Path
import os
import asyncio
from celery.result import AsyncResult
import re

# Загружаем переменные из .env файла в самом начале
load_dotenv()

# Import Celery app
from app.celery_utils import celery_app

# Import active routers
from app.api.v1 import generate, tasks
from app.services.redis_service import get_redis_client

# Инициализируем сервисы
redis_service = get_redis_client()

app = FastAPI(
    title="WiseTale API",
    description="AI-powered educational video generation",
    version="1.0.0"
)

# CORS settings
environment = os.getenv("ENVIRONMENT", "development")
if environment == "production":
    origins = ["*"]  # TODO: Replace with specific domains after deployment
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

images_dir = Path("generated_images")
images_dir.mkdir(exist_ok=True)

# We will handle video serving manually to support range requests
# app.mount("/videos", StaticFiles(directory=str(videos_dir)), name="videos")
app.mount("/audio", StaticFiles(directory=str(audio_dir)), name="audio")
app.mount("/images", StaticFiles(directory=str(images_dir)), name="images")

# Custom endpoint for serving videos with range request support
@app.get("/videos/{video_name}")
async def serve_video(video_name: str, request: Request):
    video_path = videos_dir / video_name
    if not video_path.is_file():
        return {"error": "Video not found"}, 404
    
    # Get file size
    file_size = video_path.stat().st_size
    
    # Check if Range header is present
    range_header = request.headers.get('Range')
    
    if range_header:
        # Parse range header
        range_match = re.match(r'bytes=(\d+)-(\d*)', range_header)
        if range_match:
            start = int(range_match.group(1))
            end = int(range_match.group(2)) if range_match.group(2) else file_size - 1
            
            # Ensure end doesn't exceed file size
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
    
    # No range header, return full file
    return FileResponse(
        video_path, 
        media_type="video/mp4", 
        headers={"Accept-Ranges": "bytes"}
    )


# Include active routers
app.include_router(generate.router, prefix="/api/v1")
app.include_router(tasks.router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "WiseTale API is running!", "version": "1.0.0"}

@app.get("/health")
async def health():
    return {"status": "healthy", "environment": environment}

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
