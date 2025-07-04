from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import Optional
import logging

from ...schemas.task import TaskCreate, TaskResponse, TaskStatusResponse, TaskResult
from ...services.task_service import task_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.post("/generate", response_model=TaskResponse)
async def create_generation_task(task_data: TaskCreate):
    """Create a new video generation task (async)"""
    try:
        response = await task_service.create_task(task_data)
        logger.info(f"Created task {response.task_id} for {task_data.subject}: {task_data.topic}")
        return response
    except Exception as e:
        logger.error(f"Failed to create task: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create task: {str(e)}")


@router.get("/{task_id}/status", response_model=TaskStatusResponse)
async def get_task_status(task_id: str):
    """Get task status and progress"""
    try:
        task_status = await task_service.get_task_status(task_id)
        if not task_status:
            raise HTTPException(status_code=404, detail="Task not found")
        
        return task_status
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get task status {task_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get task status: {str(e)}")


@router.get("/{task_id}/result", response_model=TaskResult)
async def get_task_result(task_id: str):
    """Get completed task result"""
    try:
        result = await task_service.get_task_result(task_id)
        if not result:
            # Check if task exists
            task_status = await task_service.get_task_status(task_id)
            if not task_status:
                raise HTTPException(status_code=404, detail="Task not found")
            
            if task_status.status == "failed":
                raise HTTPException(status_code=400, detail=f"Task failed: {task_status.error}")
            elif task_status.status != "completed":
                raise HTTPException(status_code=202, detail="Task not completed yet")
            else:
                raise HTTPException(status_code=404, detail="Task result not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get task result {task_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get task result: {str(e)}")


@router.get("/{task_id}")
async def get_task_info(task_id: str):
    """Get complete task information (status + result if available)"""
    try:
        task_status = await task_service.get_task_status(task_id)
        if not task_status:
            raise HTTPException(status_code=404, detail="Task not found")
        
        response = {
            "task_id": task_id,
            "status": task_status.status,
            "progress": task_status.progress,
            "message": task_status.message,
            "created_at": task_status.created_at,
            "updated_at": task_status.updated_at,
            "error": task_status.error
        }
        
        # Add result if completed
        if task_status.status == "completed" and task_status.result:
            response["result"] = task_status.result
        
        return response
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get task info {task_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get task info: {str(e)}")


@router.get("/")
async def list_tasks(user_id: Optional[int] = None, limit: int = 10):
    """List recent tasks (optional: filter by user_id)"""
    # TODO: Implement task listing from Redis/Database
    return {"message": "Task listing not implemented yet", "user_id": user_id, "limit": limit}


@router.delete("/{task_id}")
async def cancel_task(task_id: str):
    """Cancel a task (if still pending/in_progress)"""
    try:
        task_status = await task_service.get_task_status(task_id)
        if not task_status:
            raise HTTPException(status_code=404, detail="Task not found")
        
        if task_status.status in ["completed", "failed"]:
            raise HTTPException(status_code=400, detail="Cannot cancel completed or failed task")
        
        # Mark as failed to effectively cancel
        await task_service.fail_task(task_id, "Task cancelled by user")
        
        return {"message": "Task cancelled successfully", "task_id": task_id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to cancel task {task_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to cancel task: {str(e)}")


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "task-service"} 