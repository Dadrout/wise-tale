import httpx
import asyncio
from uuid import uuid4
import logging
import json # Make sure json is imported

from app.core.config import settings

logger = logging.getLogger(__name__)

class RunwareService:
    def __init__(self):
        if not settings.RUNWARE_API_KEY:
            raise ValueError("RUNWARE_API_KEY is not set in the environment variables.")
        
        self.api_key = settings.RUNWARE_API_KEY
        self.base_url = "https://api.runware.ai/v1"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

    async def _send_request(self, payload: dict | list):
        async with httpx.AsyncClient(timeout=120.0) as client:
            try:
                response = await client.post(f"{self.base_url}/tasks", headers=self.headers, json=payload)
                response.raise_for_status()
                return response.json()
            except httpx.HTTPStatusError as e:
                logger.error(f"Runware API request failed with status {e.response.status_code}: {e.response.text}")
                # Re-raise the exception to be handled by the caller
                raise
            except Exception as e:
                logger.error(f"An unexpected error occurred while calling Runware API: {e}", exc_info=True)
                raise

    async def generate_image(self, prompt: str) -> str | None:
        """
        Generates a single image using the Runware API.
        """
        task_uuid = str(uuid4())
        payload = {
            "taskType": "imageInference",
            "taskUUID": task_uuid,
            "model": "runware:100@1",
            "steps": 4,
            "positivePrompt": prompt,
            "style_preset": "base-cinematic",
            "width": 1024,
            "height": 576
        }
        
        try:
            response_data = await self._send_request(payload)
            
            # Check for errors in the response body
            if response_data.get("errors"):
                logger.error(f"Runware API returned errors: {response_data['errors']}")
                return None
            
            # Find the result for our task
            task_result = next((item for item in response_data.get("data", []) if item.get("taskUUID") == task_uuid), None)
            
            if task_result and task_result.get("imageURL"):
                logger.info(f"Successfully generated image with Runware for prompt: '{prompt[:50]}...'")
                return task_result["imageURL"]
            else:
                logger.warning(f"No imageURL found in Runware response for task {task_uuid}.")
                return None
                
        except Exception:
            # Error is already logged in _send_request, just return None
            return None

    async def generate_images_from_prompts(self, prompts: list[str]) -> list[str]:
        """
        Generates multiple images from a list of prompts in a single batch request.
        """
        logger.info(f"🎨 Generating {len(prompts)} images with Runware in a single batch...")
        
        # Build payload and map UUID → original index to restore order later
        tasks_payload: list[dict] = []
        uuid_to_index: dict[str, int] = {}
        for idx, prompt in enumerate(prompts):
            task_uuid = str(uuid4())
            uuid_to_index[task_uuid] = idx
            tasks_payload.append({
                "taskType": "imageInference",
                "taskUUID": task_uuid,
                "model": "runware:100@1",
                "steps": 4,
                "positivePrompt": prompt,
                "style_preset": "base-cinematic",
                "width": 1024,
                "height": 576
            })

        try:
            # The API expects a list of tasks directly, not an object containing a 'tasks' key.
            logger.info(f"Sending payload to Runware: {json.dumps(tasks_payload, indent=2)}") # Log the exact payload
            response_data = await self._send_request(tasks_payload)
            
            if response_data.get("errors"):
                logger.error(f"Runware API returned errors for batch request: {response_data['errors']}")
                return []

            results = response_data.get("data", [])

            # Pre-fill list to maintain order
            ordered_images: list[str | None] = [None] * len(prompts)
            for item in results:
                task_uuid = item.get("taskUUID")
                img_url = item.get("imageURL")
                if task_uuid in uuid_to_index and img_url:
                    ordered_images[uuid_to_index[task_uuid]] = img_url

            # Remove Nones but keep relative order of successfully generated images
            successful_images = [url for url in ordered_images if url]

            logger.info(
                f"Successfully generated {len(successful_images)} out of {len(prompts)} images with Runware, order preserved.")
            return successful_images

        except Exception:
            return []


# Instantiate the service
runware_service = RunwareService() 