import asyncio
import uuid
import threading
from datetime import datetime
from typing import Dict, Optional, Any
from concurrent.futures import ThreadPoolExecutor
import json
import logging
from pathlib import Path

from ..schemas.task import TaskStatus, TaskCreate, TaskResponse, TaskStatusResponse, TaskResult
from .redis_service import get_redis_client

logger = logging.getLogger(__name__)


class TaskService:
    def __init__(self):
        self.tasks: Dict[str, Dict] = {}
        self.executor = ThreadPoolExecutor(max_workers=3)  # Limit concurrent video generation
        self.redis_client = get_redis_client()
        
    async def create_task(self, task_data: TaskCreate) -> TaskResponse:
        """Create a new async task"""
        task_id = str(uuid.uuid4())
        now = datetime.now()
        
        task_info = {
            "task_id": task_id,
            "status": TaskStatus.PENDING,
            "progress": 0,
            "message": "Task created, waiting to start",
            "created_at": now,
            "updated_at": now,
            "subject": task_data.subject,
            "topic": task_data.topic,
            "level": task_data.level,
            "user_id": task_data.user_id,
            "result": None,
            "error": None
        }
        
        # Store in memory (in production, use Redis/Database)
        self.tasks[task_id] = task_info
        
        # Store in Redis if available
        if self.redis_client:
            try:
                self.redis_client.setex(
                    f"task:{task_id}", 
                    3600,  # 1 hour TTL
                    json.dumps(task_info, default=str)
                )
            except Exception as e:
                logger.warning(f"Failed to store task in Redis: {e}")
        
        # Start background task
        self._start_background_task(task_id, task_data)
        
        return TaskResponse(
            task_id=task_id,
            status=TaskStatus.PENDING,
            message="Task created successfully",
            created_at=now
        )
    
    async def get_task_status(self, task_id: str) -> Optional[TaskStatusResponse]:
        """Get task status and progress"""
        # Try Redis first
        if self.redis_client:
            try:
                task_data = self.redis_client.get(f"task:{task_id}")
                if task_data:
                    task_info = json.loads(task_data)
                    return TaskStatusResponse(**task_info)
            except Exception as e:
                logger.warning(f"Failed to get task from Redis: {e}")
        
        # Fallback to memory
        task_info = self.tasks.get(task_id)
        if not task_info:
            return None
            
        return TaskStatusResponse(**task_info)
    
    async def get_task_result(self, task_id: str) -> Optional[TaskResult]:
        """Get completed task result"""
        task_status = await self.get_task_status(task_id)
        if not task_status or task_status.status != TaskStatus.COMPLETED:
            return None
            
        if not task_status.result:
            return None
            
        return TaskResult(
            task_id=task_id,
            **task_status.result,
            created_at=task_status.created_at
        )
    
    async def update_task_progress(self, task_id: str, progress: int, message: str, status: Optional[TaskStatus] = None):
        """Update task progress"""
        task_info = self.tasks.get(task_id)
        if not task_info:
            return
            
        task_info["progress"] = progress
        task_info["message"] = message
        task_info["updated_at"] = datetime.now()
        
        if status:
            task_info["status"] = status
        
        # Update Redis
        if self.redis_client:
            try:
                self.redis_client.setex(
                    f"task:{task_id}",
                    3600,
                    json.dumps(task_info, default=str)
                )
            except Exception as e:
                logger.warning(f"Failed to update task in Redis: {e}")
    
    async def complete_task(self, task_id: str, result: Dict[str, Any]):
        """Mark task as completed with result"""
        task_info = self.tasks.get(task_id)
        if not task_info:
            return
            
        task_info["status"] = TaskStatus.COMPLETED
        task_info["progress"] = 100
        task_info["message"] = "Video generation completed successfully"
        task_info["result"] = result
        task_info["updated_at"] = datetime.now()
        
        # Update Redis
        if self.redis_client:
            try:
                self.redis_client.setex(
                    f"task:{task_id}",
                    3600,
                    json.dumps(task_info, default=str)
                )
            except Exception as e:
                logger.warning(f"Failed to complete task in Redis: {e}")
    
    async def fail_task(self, task_id: str, error: str):
        """Mark task as failed"""
        task_info = self.tasks.get(task_id)
        if not task_info:
            return
            
        task_info["status"] = TaskStatus.FAILED
        task_info["message"] = f"Task failed: {error}"
        task_info["error"] = error
        task_info["updated_at"] = datetime.now()
        
        # Update Redis
        if self.redis_client:
            try:
                self.redis_client.setex(
                    f"task:{task_id}",
                    3600,
                    json.dumps(task_info, default=str)
                )
            except Exception as e:
                logger.warning(f"Failed to fail task in Redis: {e}")
    
    # def _generate_video_sync(self, subject: str, topic: str, level: str, voice: str, language: str, user_id: Optional[str], task_id: str) -> Dict[str, Any]:
    #     """Synchronous video generation for background tasks"""
    #     # Import here to avoid circular imports
    #     import asyncio
    #     from ..api.v1.generate import VideoGenerationPipeline
        
    #     try:
    #         # Update progress
    #         asyncio.run(self.update_task_progress(task_id, 10, "Generating story script..."))
            
    #         # Create pipeline
    #         # pipeline = VideoGenerationPipeline()
            
    #         # Generate story
    #         loop = asyncio.new_event_loop()
    #         asyncio.set_event_loop(loop)
            
    #         story = loop.run_until_complete(pipeline.generate_story_text(subject, topic, language))
    #         asyncio.run(self.update_task_progress(task_id, 30, "Story generated, creating audio..."))
            
    #         # Generate audio with voice and language parameter
    #         audio_url, audio_duration = loop.run_until_complete(pipeline.generate_audio_from_text(story, voice, language))
    #         asyncio.run(self.update_task_progress(task_id, 60, "Audio generated, searching for images..."))
            
    #         # Generate AI images
    #         images = loop.run_until_complete(pipeline.generate_images_ai(topic, subject, story, count=1, language=language))
    #         asyncio.run(self.update_task_progress(task_id, 80, "Images found, creating video..."))
            
    #         # Create video
    #         video_url = loop.run_until_complete(pipeline.create_video_slideshow(audio_url, audio_duration, images, story))
    #         asyncio.run(self.update_task_progress(task_id, 100, "Video generation completed!"))
            
    #         loop.close()
            
    #         # Return result
    #         return {
    #             "video_url": video_url,
    #             "audio_url": audio_url,
    #             "script": story,
    #             "duration": audio_duration,
    #             "images_used": images
    #         }
            
    #     except Exception as e:
    #         logger.error(f"Video generation failed: {e}")
    #         raise
    
    def _start_background_task(self, task_id: str, task_data: TaskCreate):
        """Start background video generation"""
        def run_generation():
            try:
                # Update status to in_progress
                asyncio.run(self.update_task_progress(
                    task_id, 0, "Starting video generation...", TaskStatus.IN_PROGRESS
                ))
                
                # Generate video (this is the slow part)
                # result = self._generate_video_sync(
                #     subject=task_data.subject,
                #     topic=task_data.topic,
                #     level=task_data.level,
                #     voice=task_data.voice,
                #     language=task_data.language,
                #     user_id=task_data.user_id,
                #     task_id=task_id
                # )
                
                # Complete task
                # asyncio.run(self.complete_task(task_id, result))
                
            except Exception as e:
                logger.error(f"Task {task_id} failed: {e}")
                asyncio.run(self.fail_task(task_id, str(e)))
        
        # Submit to thread pool
        self.executor.submit(run_generation)


# Global instance
task_service = TaskService() 