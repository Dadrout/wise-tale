from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from uuid import uuid4
import os
import logging
import json
import requests
import subprocess
import shutil
import tempfile
from pathlib import Path
import re
import math
import wave
import contextlib
import asyncio

from app.celery_utils import celery_app
from celery.result import AsyncResult
from app.core.config import settings
from app.services.firebase_service import firebase_service
from app.services.runware_service import runware_service
from app.services.pexels_service import pexels_service
from app.api.dependencies import get_current_user
from openai import AzureOpenAI
import azure.cognitiveservices.speech as speechsdk
from datetime import datetime


# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

router = APIRouter(tags=["generate"])

class GenerateRequest(BaseModel):
    subject: str
    topic: str
    persona: str = "narrator"
    language: str = "en-US"
    voice: str = "female" # 'female' or 'male'

class TaskCreationResponse(BaseModel):
    task_id: str

class VideoGenerationPipeline:
    def _clean_markdown_for_speech(self, text: str) -> str:
        text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)
        text = re.sub(r'_(.*?)_', r'\1', text)
        text = re.sub(r'#+\s*', '', text)
        text = text.replace('\n', ' ').strip()
        return text

    def _seconds_to_srt_time(self, seconds: float) -> str:
        millis = int((seconds - int(seconds)) * 1000)
        mins, secs = divmod(int(seconds), 60)
        hours, mins = divmod(mins, 60)
        return f"{hours:02d}:{mins:02d}:{secs:02d},{millis:03d}"

    def _create_subtitles(self, transcript: str, srt_file_path: Path, total_duration: float):
        sentences = [s.strip() for s in transcript.split('.') if s.strip()]
        if not sentences:
            return
        
        num_sentences = len(sentences)
        duration_per_sentence = total_duration / num_sentences
        
        with open(srt_file_path, 'w', encoding='utf-8') as f:
            for i, sentence in enumerate(sentences):
                start_time = i * duration_per_sentence
                end_time = (i + 1) * duration_per_sentence
                
                f.write(f"{i + 1}\n")
                f.write(f"{self._seconds_to_srt_time(start_time)} --> {self._seconds_to_srt_time(end_time)}\n")
                f.write(f"{sentence}.\n\n")
    
    async def generate_story_text(self, subject: str, topic: str, language: str = "en-US") -> str:
        logger.info(f"Generating story text in {language} with Azure OpenAI...")
        try:
            client = AzureOpenAI(
                azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
                api_key=settings.AZURE_OPENAI_API_KEY,
                api_version="2024-02-01"
            )
            
            system_prompt = f"You are an expert storyteller. Your task is to generate a detailed and engaging narrative about '{topic}' in the style of {subject}. The story MUST be written entirely in {language}. Do not use any other language."

            # More intelligent prompt selection based on the subject
            if subject.lower() in ["history", "historical events", "historical figures"]:
                user_prompt = f"""
Act as an expert historian and storyteller. Your task is to generate a detailed and historically accurate narrative about '{topic}'.

First, create a clear plan for the story. This plan should outline the key sections:
1.  **Introduction:** Set the scene and introduce the core conflict or context.
2.  **Key Causes & Background:** Explain the main reasons leading up to the event.
3.  **Major Events & Turning Points:** Detail the most significant moments in chronological order. Mention key figures, dates, and locations.
4.  **Climax:** Describe the peak of the event or conflict.
5.  **Resolution & Aftermath:** Explain the outcome and its immediate consequences.
6.  **Conclusion & Legacy:** Summarize the event's long-term significance and what we can learn from it.

Second, based on that plan, write a comprehensive and engaging story of at least 1000 words.
The narrative should be rich with detail, creating a vivid atmosphere for the reader.
The output MUST be only the final story text, written in {language}, without the plan, titles, or any other introductory text.
IMPORTANT: The entire story must be in {language}.
"""
            else:
                user_prompt = f"""
As an expert storyteller, write a captivating and immersive short story about '{topic}' within the context of {subject}.
Focus on building a strong narrative, developing characters, and creating a vivid atmosphere that brings the subject to life.
The tone should be engaging and imaginative, suitable for a curious adult.
Do not write a simple summary or a children's fairy tale.
Ensure the story is complete and has a clear beginning, middle, and end of at least 1000 words.
The output must be only the story text itself, written in {language}, without any introductions, summaries, or author's notes.
IMPORTANT: The entire story must be in {language}.
"""

            response = client.chat.completions.create(
                model=settings.AZURE_OPENAI_DEPLOYMENT_NAME,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,
                max_tokens=3500
            )
            story = response.choices[0].message.content.strip()
            logger.info(f"Successfully generated story text ({len(story)} chars) in {language}.")
            return story
        except Exception as e:
            logger.error(f"Azure OpenAI text generation failed in {language}: {e}", exc_info=True)
            raise

    async def generate_audio_from_text(self, text: str, voice: str = "female", language: str = "en-US") -> tuple[str, float]:
        logger.info(f"Generating audio in {language} with Azure Speech Service, voice '{voice}'...")

        def _synthesize_sync():
            try:
                speech_config = speechsdk.SpeechConfig(subscription=settings.AZURE_SPEECH_KEY, region=settings.AZURE_SPEECH_REGION)
                
                # Set the output audio format for higher quality
                speech_config.set_speech_synthesis_output_format(speechsdk.SpeechSynthesisOutputFormat.Audio24Khz160KBitRateMonoMp3)
                
                # Select voice based on user choice
                if voice.lower() == 'male':
                    voice_name = "en-US-BrianMultilingualNeural"
                else: # Default to female
                    voice_name = "en-US-EmmaMultilingualNeural"

                speech_config.speech_synthesis_voice_name = voice_name

                output_dir = Path("generated_audio")
                output_dir.mkdir(exist_ok=True)
                audio_file_path = output_dir / f"{uuid4().hex}.mp3" # Output as MP3
                
                file_config = speechsdk.audio.AudioOutputConfig(filename=str(audio_file_path))
                speech_synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config, audio_config=file_config)
                
                # Using SSML to control the style of the speech and set language
                # The "storytelling" style is removed as it's not supported by all languages in multilingual voices.
                ssml_text = f"""
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="{language}">
    <voice name="{voice_name}">
        {text}
    </voice>
</speak>
"""
                result = speech_synthesizer.speak_ssml_async(ssml_text).get()
                
                if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
                    # For MP3, we can't use `wave` to get duration. Let's estimate or use another tool if needed.
                    # A simpler approach is to rely on the SDK if it provides it, or a library like mutagen.
                    # For now, we will use a rough estimation or leave it for a proper library later.
                    # Let's use `ffprobe` as a reliable way to get duration.
                    try:
                        cmd = ['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', str(audio_file_path)]
                        duration_str = subprocess.check_output(cmd).decode('utf-8').strip()
                        duration = float(duration_str)
                    except (subprocess.CalledProcessError, FileNotFoundError):
                        # Fallback estimation if ffprobe is not available
                        audio_data = result.audio_data
                        duration = len(audio_data) / (24000 * 2) # A rough estimate for 24kHz, 16-bit mono
                    
                    logger.info(f"Audio generation successful. File: {audio_file_path}, Duration: {duration:.2f}s, Language: {language}")
                    return str(audio_file_path), duration
                else:
                    error_details = result.cancellation_details
                    logger.error(f"Audio synthesis failed: {result.reason}. Details: {error_details}")
                    raise Exception(f"Audio synthesis failed: {result.reason}. Details: {error_details}")
            except Exception as e:
                logger.error(f"Azure Speech audio generation failed: {e}", exc_info=True)
                raise

        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, _synthesize_sync)

    async def _generate_prompts_from_story(self, story_text: str, topic: str, count: int, language: str = "en-US") -> list[str]:
        logger.info(f"Generating {count} image prompts from story text in {language}...")
        try:
            client = AzureOpenAI(
                azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
                api_key=settings.AZURE_OPENAI_API_KEY,
                api_version="2024-02-01"
            )

            if count == 1:
                # For single image, create one comprehensive prompt
                prompt_generation_prompt = f"""
Based on the following story about '{topic}', create a single, comprehensive, and vivid prompt for an AI image generator.
The story is written in {language}. The prompt you generate MUST be in English.
The prompt should capture the essence and main theme of the entire story in a cinematic, photorealistic style.
Focus on the most important visual elements, atmosphere, and setting that would best represent this story.
The prompt must be in English and should be detailed but concise.

Story:
\"\"\"{story_text}\"\"\"

Create a single image prompt that captures the story's essence (in English):
"""
                
                response = client.chat.completions.create(
                    model=settings.AZURE_OPENAI_DEPLOYMENT_NAME,
                    messages=[{"role": "user", "content": prompt_generation_prompt}],
                    temperature=0.7,
                    max_tokens=200
                )
                
                prompt = response.choices[0].message.content
                if prompt:
                    result = [prompt.strip().replace('"', '')]
                    logger.info(f"Successfully generated single prompt: {result}")
                    return result
                else:
                    logger.warning("OpenAI returned empty response for single prompt generation")
                    return [f"A cinematic scene about {topic}"]
            
            else:
                # Original logic for multiple images (kept for backward compatibility)
                # Step 1: Divide the story into logical scenes or paragraphs
                scene_division_prompt = f"""
Analyze the following story about '{topic}' written in {language}. Divide it into {count} distinct scenes or key narrative moments.
Each scene should represent a clear visual moment or a turning point in the story.
Return the scenes as a JSON array of strings. For example: ["Scene 1 text...", "Scene 2 text...", ...].
Do not include any other text or explanation in your response.

Story:
\"\"\"
{story_text}
\"\"\"
"""
                scene_response = client.chat.completions.create(
                    model=settings.AZURE_OPENAI_DEPLOYMENT_NAME,
                    messages=[{"role": "user", "content": scene_division_prompt}],
                    temperature=0.2,
                    max_tokens=1000,
                    response_format={"type": "json_object"}
                )
                
                scenes_json = scene_response.choices[0].message.content
                story_chunks = json.loads(scenes_json).get("scenes", [])
                
                if not story_chunks or len(story_chunks) < count:
                    logger.warning(f"Could not divide story into {count} scenes. Falling back to chunking.")
                    # Fallback to simple chunking if scene division fails
                    words = story_text.split()
                    chunk_size = math.ceil(len(words) / count)
                    story_chunks = [" ".join(words[i:i+chunk_size]) for i in range(0, len(words), chunk_size)]

                # Step 2: Generate a prompt for each scene
                tasks = []
                for chunk in story_chunks:
                    prompt_generation_prompt = f"""
Based on the following story segment about '{topic}' (written in {language}), create a single, concise, and vivid prompt for an AI image generator.
The prompt must be in English.
The prompt should be in a "cinematic" or "photorealistic" style, focusing on visual details, atmosphere, and action.
Do not just summarize the text. Create an artistic and descriptive instruction for generating a compelling image.

Story Segment:
\"\"\"{chunk}\"\"\"

Prompt (in English):
"""
                    task = client.chat.completions.create(
                        model=settings.AZURE_OPENAI_DEPLOYMENT_NAME,
                        messages=[{"role": "user", "content": prompt_generation_prompt}],
                        temperature=0.7,
                        max_tokens=150
                    )
                    tasks.append(task)
                
                # Use asyncio.gather with to_thread to run blocking calls concurrently
                prompt_responses = []
                for task in tasks:
                    try:
                        response = task.choices[0].message.content
                        if response:
                            prompt_responses.append(response.strip().replace('"', ''))
                        else:
                            logger.warning("OpenAI returned empty response for prompt generation")
                            prompt_responses.append(f"A cinematic scene about {topic}")
                    except Exception as e:
                        logger.error(f"Error processing OpenAI response: {e}")
                        prompt_responses.append(f"A cinematic scene about {topic}")
                
                prompts = list(prompt_responses)
                logger.info(f"Successfully generated {len(prompts)} prompts: {prompts}")
                return prompts
                
        except json.JSONDecodeError as e:
            logger.error(f"Failed to decode scenes from story: {e}. Raw response: {scenes_json}")
            return [f"A cinematic scene about {topic}" for _ in range(count)]
        except Exception as e:
            logger.error(f"Failed to generate prompts from story: {e}")
            return [f"A cinematic scene about {topic}" for _ in range(count)]


    async def generate_images_ai(self, topic: str, subject: str, story: str, count: int = 1, language: str = "en-US") -> list[str]:
        logger.info(f"Generating {count} AI images for '{topic}'...")
        
        image_prompts = await self._generate_prompts_from_story(story, topic, count, language)
        if not image_prompts:
            logger.warning("Could not generate prompts from story, falling back to Pexels.")
            return await self.search_images_pexels_fallback(topic, subject, story, count)

        ai_images = await runware_service.generate_images_from_prompts(image_prompts)
        
        if ai_images and len(ai_images) >= count // 2:
            logger.info(f"Successfully generated {len(ai_images)} images with Runware.")
            return ai_images
        
        logger.warning("Runware image generation failed or returned too few images, falling back to Pexels.")
        return await self.search_images_pexels_fallback(topic, subject, story, count)

    async def search_images_pexels_fallback(self, topic: str, subject: str, story_text: str = "", count: int = 8) -> list[str]:
        logger.warning("Falling back to Pexels for image search.")
        try:
            pexels_query = f"{topic} {subject}"
            images_data = await pexels_service.search_images(pexels_query, per_page=count)
            if images_data:
                urls = [img['url'] for img in images_data if 'url' in img]
                logger.info(f"Found {len(urls)} images from Pexels fallback.")
                return urls
            return []
        except Exception as e:
            logger.error(f"Pexels fallback failed: {e}", exc_info=True)
            return []
            
    async def download_image(self, url: str, path: Path) -> bool:
        try:
            response = requests.get(url, stream=True, timeout=20)
            response.raise_for_status()
            with open(path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            return True
        except Exception as e:
            logger.error(f"Failed to download image {url}: {e}")
            return False

    async def create_video_slideshow(self, audio_path: str, audio_duration: float, images: list[str], transcript: str) -> str:
        logger.info(f"Starting video slideshow creation with {len(images)} images and {audio_duration:.2f}s audio.")
        with tempfile.TemporaryDirectory() as temp_dir_str:
            temp_dir = Path(temp_dir_str)
            
            downloaded_images = []
            for i, img_url in enumerate(images):
                img_path = temp_dir / f"image_{i:03d}.jpg"
                if await self.download_image(img_url, img_path):
                    downloaded_images.append(str(img_path))

            if not downloaded_images:
                raise ValueError("No images were successfully downloaded for video creation.")
            
            # Temporarily disabled subtitle generation to fix seeking issue
            # srt_path = temp_dir / "subtitles.srt"
            # self._create_subtitles(transcript, srt_path, audio_duration)

            ffmpeg_cmd = ['ffmpeg', '-y']
            
            num_images = len(downloaded_images)
            image_duration = audio_duration / num_images
            fade_duration = 1.0
            
            for i, img_path in enumerate(downloaded_images):
                ffmpeg_cmd.extend(['-loop', '1', '-t', str(image_duration), '-i', img_path])
            ffmpeg_cmd.extend(['-i', audio_path])
            
            filter_complex = []
            for i in range(num_images):
                filter_complex.append(f"[{i}:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:color=black,setpts=PTS-STARTPTS[v{i}];")

            prev_stream = "v0"
            for i in range(1, num_images):
                next_stream = "v" + str(i)
                offset = (i * image_duration) - fade_duration
                temp_stream = f"tmp{i}"
                filter_complex.append(f"[{prev_stream}][{next_stream}]xfade=transition=fade:duration={fade_duration}:offset={offset}[{temp_stream}];")
                prev_stream = temp_stream
            
            filter_complex.append(f"[{prev_stream}]setpts=PTS-STARTPTS[final_video]")

            ffmpeg_cmd.extend(['-filter_complex', "".join(filter_complex)])
            
            output_dir = Path("generated_videos")
            output_dir.mkdir(exist_ok=True)
            final_video_path = output_dir / f"{uuid4().hex}.mp4"

            ffmpeg_cmd.extend([
                '-map', '[final_video]',
                '-map', f'{num_images}:a',
                '-c:v', 'libx264', '-preset', 'medium', '-crf', '23', '-pix_fmt', 'yuv420p',
                '-r', '25',
                '-movflags', '+faststart', # Added for better streaming
                str(final_video_path)
            ])
            
            logger.info(f"Running ffmpeg... {' '.join(ffmpeg_cmd)}")
            try:
                result = subprocess.run(ffmpeg_cmd, capture_output=True, text=True, timeout=600)
                if result.returncode != 0:
                    logger.error(f"FFmpeg failed with exit code {result.returncode}")
                    logger.error(f"FFmpeg stderr: {result.stderr}")
                    raise RuntimeError(f"FFmpeg execution failed: {result.stderr}")
                
                logger.info(f"Video created successfully: {final_video_path}")
                return str(final_video_path)
            
            except subprocess.TimeoutExpired as e:
                logger.error(f"FFmpeg command timed out after 600 seconds: {e}")
                raise
            except Exception as e:
                logger.error(f"An error occurred during video creation: {e}", exc_info=True)
                raise

pipeline = VideoGenerationPipeline()

@celery_app.task(bind=True, name="generate_story_video_task")
def generate_story_video_task(self, request_data: dict, user_id: str):
    """
    Celery task to generate a story video.
    Now accepts user_id.
    """
    pipeline = VideoGenerationPipeline()
    
    async def main_task_flow():
        subject = request_data.get("subject", "general")
        topic = request_data.get("topic", "a magical story")
        voice = request_data.get("voice", "female") # Get voice from request_data
        language = request_data.get("language", "en-US") # Get language from request_data
        
        try:
            self.update_state(state='PROGRESS', meta={'status': 'Generating story text...', 'progress': 10})
            story_text = await pipeline.generate_story_text(subject, topic, language)

            self.update_state(state='PROGRESS', meta={'status': 'Generating audio...', 'progress': 30})
            audio_path, audio_duration = await pipeline.generate_audio_from_text(story_text, voice, language)
            
            self.update_state(state='PROGRESS', meta={'status': 'Generating images...', 'progress': 50})
            image_urls = await pipeline.generate_images_ai(topic, subject, story_text, count=1, language=language)
            
            self.update_state(state='PROGRESS', meta={'status': 'Creating video...', 'progress': 75})
            local_video_path = await pipeline.create_video_slideshow(audio_path, audio_duration, image_urls, story_text)

            self.update_state(state='PROGRESS', meta={'status': 'Uploading video to cloud...', 'progress': 90})
            video_filename = f"generated_videos/{user_id}/{Path(local_video_path).name}"
            final_video_url = await firebase_service.upload_file(local_video_path, video_filename)

            # Clean up local files
            os.remove(local_video_path)
            os.remove(audio_path)
            
            self.update_state(state='PROGRESS', meta={'status': 'Saving story to database...', 'progress': 95})
            story_data_to_save = {
                "userId": user_id,
                "taskId": self.request.id,
                "subject": subject,
                "topic": topic,
                "videoUrl": final_video_url,
                "storyText": story_text,
                "createdAt": datetime.utcnow()
            }
            await firebase_service.save_story_to_firestore(user_id, story_data_to_save)
            
            logger.info(f"Task {self.request.id} completed successfully. Video URL: {final_video_url}")
            return {'status': 'Success', 'video_url': final_video_url, 'progress': 100}
            
        except Exception as e:
            self.update_state(state='FAILURE', meta={'exc_type': type(e).__name__, 'exc_message': str(e), 'progress': 0})
            logger.error(f"Task {self.request.id} failed: {e}", exc_info=True)
            # Here you could also store the failure in Firebase/Supabase against the user_id
            return {'status': 'Failure', 'error': str(e), 'progress': 0}

    return asyncio.run(main_task_flow())


@router.post("/generate", response_model=TaskCreationResponse, status_code=202)
async def create_generation_task(req: GenerateRequest, user: dict = Depends(get_current_user)):
    """
    Creates a new background task for video generation.
    """
    user_id = user.get("sub")
    if not user_id:
        raise HTTPException(status_code=403, detail="User ID not found in token")

    # Pass the full request data to the Celery task
    task_request_data = req.dict()
    
    task = generate_story_video_task.delay(task_request_data, user_id)
    return TaskCreationResponse(task_id=task.id)


@router.get("/tasks/{task_id}")
async def get_task_status(task_id: str):
    """
    Retrieves the status of a generation task.
    """
    task_result = AsyncResult(task_id, app=celery_app)
    
    response = {
        "task_id": task_id,
        "status": task_result.status,
        "info": task_result.info,
    }
    
    if task_result.failed():
        response['error'] = str(task_result.result)

    return response

@router.get("/health")
async def health_check():
    return {"status": "ok"} 

@router.post("/enhance-prompt")
async def enhance_prompt(request: dict):
    """
    Enhance a story prompt using AI
    """
    try:
        description = request.get("description", "")
        language = request.get("language", "en-US") # Get language from request
        if not description.strip():
            raise HTTPException(status_code=400, detail="Description is required")
        
        client = AzureOpenAI(
            azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
            api_key=settings.AZURE_OPENAI_API_KEY,
            api_version="2024-02-01"
        )
        
        enhance_prompt = f"""
You are a creative writing assistant. Take the following story idea and enhance it to make it more engaging, detailed, and suitable for video generation.
The original idea is in {language}. Please provide the enhanced version in the SAME language.

Original idea: "{description}"

Please enhance this idea by:
1. Adding more vivid details and atmosphere
2. Developing characters and their motivations
3. Creating a clear narrative arc with beginning, middle, and end
4. Adding emotional depth and conflict
5. Making it more cinematic and visual

Return only the enhanced story description, in {language}, nothing else. Keep it under 500 words but make it rich and engaging.
"""
        
        response = client.chat.completions.create(
            model=settings.AZURE_OPENAI_DEPLOYMENT_NAME,
            messages=[{"role": "user", "content": enhance_prompt}],
            temperature=0.8,
            max_tokens=800
        )
        
        enhanced_description = response.choices[0].message.content.strip()
        
        return {"enhanced_description": enhanced_description}
        
    except Exception as e:
        logger.error(f"Failed to enhance prompt: {e}")
        raise HTTPException(status_code=500, detail="Failed to enhance prompt") 