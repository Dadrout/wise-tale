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

# Define base directory for static files
static_dir = Path("static")

class GenerateRequest(BaseModel):
    subject: str
    topic: str
    persona: str = "narrator"
    language: str = "en-US"
    voice: str = "female" # 'female' or 'male'

class TaskCreationResponse(BaseModel):
    task_id: str

class VideoGenerationPipeline:
    def __init__(self, user_id: str, temp_dir: Path):
        """Initializes the pipeline with user and temporary directory context."""
        self.user_id = user_id
        self.temp_dir = temp_dir
        self.user_dir = static_dir / self.user_id
        
        # Ensure the user-specific directory exists
        self.user_dir.mkdir(parents=True, exist_ok=True)
        logger.info(f"Pipeline initialized for user '{user_id}' with temp dir '{temp_dir}' and user dir '{self.user_dir}'")

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
        """
        Create SRT subtitles with intelligent text segmentation and improved timing
        """
        # Clean the transcript first
        clean_transcript = self._clean_markdown_for_speech(transcript)
        
        # Split into sentences using multiple delimiters
        import re
        sentences = re.split(r'[.!?]+', clean_transcript)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        if not sentences:
            return
        
        # Further split long sentences into phrases for better readability
        phrases = []
        for sentence in sentences:
            # If sentence is too long (>80 chars), split it into phrases
            if len(sentence) > 80:
                # Split on common phrase boundaries
                parts = re.split(r'[,;:]+|\s+(?:and|but|or|because|since|while|when|where|which|that|after|before|during|until)\s+', sentence)
                parts = [p.strip() for p in parts if p.strip()]
                phrases.extend(parts)
            else:
                phrases.append(sentence)
        
        # Remove empty phrases and ensure minimum length
        phrases = [p for p in phrases if len(p.strip()) > 5]
        
        if not phrases:
            # Fallback to original sentence splitting
            phrases = sentences
        
        num_phrases = len(phrases)
        
        # Calculate timing based on phrase length and speech rate
        # Average reading speed: ~150-200 words per minute
        # We'll use a more sophisticated timing calculation
        phrase_timings = []
        total_words = sum(len(phrase.split()) for phrase in phrases)
        
        if total_words > 0:
            words_per_second = total_words / total_duration
            
            current_time = 0
            for phrase in phrases:
                words_in_phrase = len(phrase.split())
                # Calculate duration based on word count with minimum/maximum bounds
                phrase_duration = max(1.5, min(6.0, words_in_phrase / words_per_second))
                
                # Add small pause between phrases (0.2-0.5 seconds)
                pause_duration = 0.3 if len(phrase) > 40 else 0.2
                
                start_time = current_time
                end_time = current_time + phrase_duration
                
                phrase_timings.append((start_time, end_time, phrase))
                current_time = end_time + pause_duration
        else:
            # Fallback to equal distribution
            duration_per_phrase = total_duration / num_phrases
            for i, phrase in enumerate(phrases):
                start_time = i * duration_per_phrase
                end_time = (i + 1) * duration_per_phrase
                phrase_timings.append((start_time, end_time, phrase))
        
        # Write SRT file with improved timing
        with open(srt_file_path, 'w', encoding='utf-8') as f:
            for i, (start_time, end_time, phrase) in enumerate(phrase_timings):
                # Ensure we don't exceed total duration
                end_time = min(end_time, total_duration)
                
                # Clean up the phrase
                phrase = phrase.strip()
                if not phrase.endswith(('.', '!', '?', ',', ';', ':')):
                    phrase += '.'
                
                # Ensure subtitle text is not too long (max 2 lines, ~45 chars per line)
                if len(phrase) > 90:
                    # Split into two lines at a natural break
                    words = phrase.split()
                    mid_point = len(words) // 2
                    
                    # Try to find a better split point near the middle
                    for j in range(max(1, mid_point - 2), min(len(words), mid_point + 3)):
                        if words[j-1].endswith((',', ';', ':', 'and', 'but', 'or')):
                            mid_point = j
                            break
                    
                    line1 = ' '.join(words[:mid_point])
                    line2 = ' '.join(words[mid_point:])
                    phrase = f"{line1}\n{line2}"
                
                f.write(f"{i + 1}\n")
                f.write(f"{self._seconds_to_srt_time(start_time)} --> {self._seconds_to_srt_time(end_time)}\n")
                f.write(f"{phrase}\n\n")
    
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

                # The user-specific directory will be created in the main task
                # Here we just ensure the base audio dir exists, though it's redundant
                # if the main task logic is correct.
                audio_file_path = self.temp_dir / f"{uuid4().hex}.mp3"
                
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
                # New logic: split story into paragraphs to preserve natural order.
                paragraphs = [p.strip() for p in re.split(r"\n\s*\n", story_text) if p.strip()]

                if not paragraphs:
                    # Fallback: basic word chunking
                    words = story_text.split()
                    chunk_size = math.ceil(len(words) / count)
                    paragraphs = [" ".join(words[i:i + chunk_size]) for i in range(0, len(words), chunk_size)]

                # Adjust number of chunks to requested count
                if len(paragraphs) > count:
                    # Merge neighbouring paragraphs to fit exactly `count` chunks while preserving order
                    merged_chunks = []
                    chunk_size = math.ceil(len(paragraphs) / count)
                    for i in range(0, len(paragraphs), chunk_size):
                        merged_chunks.append(" ".join(paragraphs[i:i + chunk_size]))
                    story_chunks = merged_chunks[:count]
                else:
                    story_chunks = paragraphs  # may be fewer than count; caller will still request same amount

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

    def _split_transcript(self, transcript: str, n_chunks: int) -> list[str]:
        """Splits the transcript into *roughly* ``n_chunks`` segments preserving order.

        If there are fewer paragraphs than requested chunks, fall back to even word slicing.
        """
        # Try paragraph-based first
        paragraphs = [p.strip() for p in re.split(r"\n\s*\n", transcript) if p.strip()]

        if len(paragraphs) >= n_chunks:
            # Merge paragraphs to fit exactly n_chunks
            merged: list[str] = []
            chunk_size = math.ceil(len(paragraphs) / n_chunks)
            for i in range(0, len(paragraphs), chunk_size):
                merged.append(" ".join(paragraphs[i:i + chunk_size]))
            return merged[:n_chunks]

        # Fallback: even word slicing
        words = transcript.split()
        if not words:
            return [transcript] * n_chunks

        chunk_word_len = math.ceil(len(words) / n_chunks)
        return [" ".join(words[i:i + chunk_word_len]) for i in range(0, len(words), chunk_word_len)][:n_chunks]

    async def create_video_slideshow(self, audio_path: str, audio_duration: float, images: list[str], transcript: str, task_instance=None) -> str:
        if not images:
            logger.error("No images provided for video slideshow.")
            raise ValueError("Cannot create video without images.")

        logger.info(f"Creating video slideshow with {len(images)} images and audio duration {audio_duration:.2f}s.")
        
        # Ensure the final output directory exists
        output_video_path = self.user_dir / "video.mp4"

        # Generate subtitles file
        srt_path = self.user_dir / "subtitles.srt"
        self._create_subtitles(transcript, srt_path, audio_duration)

        ENABLE_SUBTITLES = True  # overlay subtitles with libass
        
        # Dynamically allocate durations based on transcript chunk lengths
        chunks = self._split_transcript(transcript, len(images))
        total_words = sum(len(c.split()) for c in chunks) or 1
        durations: list[float] = []
        for c in chunks:
            chunk_words = len(c.split())
            durations.append(audio_duration * chunk_words / total_words)

        # Build ffmpeg inputs for each image (looped stills)
        ffmpeg_cmd = ['ffmpeg', '-y']
        filter_parts: list[str] = []
        transition_dur = 1.0  # seconds for each cross-fade
        cum_time = 0.0

        # Append image inputs
        for idx, (image_path, dur) in enumerate(zip(images, durations)):
            ffmpeg_cmd.extend(['-loop', '1', '-t', f"{dur + transition_dur}", '-i', image_path])
            # Scale/pad and apply gentle Ken Burns (zoom)
            frames = int((dur + transition_dur) * 25)
            # Apply Ken Burns before padding so zoom remains visible; increase zoom speed for clarity (≈20% over clip)
            filter_parts.append(
                f"[{idx}:v]scale=1280:720:force_original_aspect_ratio=decrease,"
                # Start at original size (1.0) and zoom in to 1.3 with slight diagonal pan. fps=25 guarantees frame duplication for still images.
                f"zoompan=z='min(zoom+0.004,1.3)':fps=25:d={frames}:x='iw/2-(iw/zoom/2)+in*0.4':y='ih/2-(ih/zoom/2)+in*0.3':s=1280x720,"
                f"pad=1280:720:(ow-iw)/2:(oh-ih)/2:color=black,setpts=PTS-STARTPTS[v{idx}]"
            )

        # Chain xfade filters
        xfade_parts: list[str] = []
        for idx in range(len(images) - 1):
            offset = cum_time + durations[idx]  # start of transition
            input_a = f"v{idx}" if idx == 0 else f"x{idx}"
            input_b = f"v{idx + 1}"
            out_label = f"x{idx + 1}"
            xfade_parts.append(f"[{input_a}][{input_b}]xfade=transition=fade:duration={transition_dur}:offset={offset}[{out_label}]")
            cum_time += durations[idx]

        # Final video label
        final_label = f"x{len(images) - 1}" if len(images) > 1 else "v0"

        # Combine filters
        filter_complex = ";".join(filter_parts + xfade_parts)

        # Add subtitles overlay on the final composite if enabled
        if ENABLE_SUBTITLES:
            filter_complex += f";[{final_label}]subtitles={srt_path}:fontsdir=/usr/share/fonts[vout]"
            final_label = "vout"

        ffmpeg_cmd.extend(['-i', audio_path, '-filter_complex', filter_complex, '-map', f"[{final_label}]", '-map', f"{len(images)}:a", '-c:v', 'libx264', '-c:a', 'aac', '-b:a', '192k', '-pix_fmt', 'yuv420p', '-shortest', str(output_video_path)])
        # Note: audio is the last input (index len(images))
 
        try:
            logger.info("Running ffmpeg command to create video...")
            logger.debug(f"FFMPEG command: {' '.join(ffmpeg_cmd)}")
            
            process = await asyncio.create_subprocess_exec(
                *ffmpeg_cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )

            time_regex = re.compile(r"time=(\d{2}):(\d{2}):(\d{2})\.(\d{2})")
            
            last_reported_progress = -1
            async for line in process.stderr:
                line_str = line.decode('utf-8').strip()
                match = time_regex.search(line_str)
                if match:
                    hours, mins, secs, ms = map(int, match.groups())
                    processed_time = hours * 3600 + mins * 60 + secs + ms / 100
                    
                    if audio_duration > 0:
                        # Map ffmpeg processing (85-95%) to overall progress
                        progress = 85 + int((processed_time / audio_duration) * 10)
                        progress = min(progress, 95)
                        
                        if task_instance and progress > last_reported_progress:
                            logger.info(f"FFMPEG progress: {progress}% (processed {processed_time:.2f}s / {audio_duration:.2f}s)")
                            task_instance.update_state(
                                state='PROGRESS',
                                meta={'progress': progress, 'message': f'Rendering video... {progress}%', 'step': 'video_creation'}
                            )
                            last_reported_progress = progress
                else:
                    # Log other stderr output for debugging
                    if line_str:
                        logger.debug(f"ffmpeg_stderr: {line_str}")

            stdout_data = await process.stdout.read()
            return_code = await process.wait()

            if return_code != 0:
                logger.error(f"ffmpeg failed with return code {return_code}")
                if stdout_data:
                    logger.error(f"ffmpeg stdout:\n{stdout_data.decode('utf-8')}")
                # stderr was already consumed and logged
                raise RuntimeError(f"ffmpeg failed to create video. Check logs for details.")
            else:
                logger.info("ffmpeg command completed successfully.")
                if stdout_data:
                    logger.debug(f"ffmpeg stdout:\n{stdout_data.decode('utf-8')}")
            
            return str(output_video_path)
        finally:
            pass  # no temp concat file to remove now

# This instance was causing the crash on startup.
# pipeline = VideoGenerationPipeline() 

@celery_app.task(bind=True, name="generate_story_video_task")
def generate_story_video_task(self, request_data: dict, user_id: str):
    """
    Celery task to generate a story video.
    This task is now fully synchronous internally to avoid event loop conflicts.
    """
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    temp_dir_str = None
    try:
        with tempfile.TemporaryDirectory() as temp_dir_str:
            temp_dir_path = Path(temp_dir_str)
            pipeline = VideoGenerationPipeline(user_id=user_id, temp_dir=temp_dir_path)
            
            # Unpack request data for easier access
            subject = request_data['subject']
            topic = request_data['topic']
            language = request_data.get('language', 'en-US')
            voice = request_data.get('voice', 'female')

            # Step 1: Text generation (0-20%)
            self.update_state(state='PROGRESS', meta={'progress': 5, 'message': 'Generating story text...', 'step': 'text_generation'})
            story = loop.run_until_complete(pipeline.generate_story_text(subject, topic, language))
            self.update_state(state='PROGRESS', meta={'progress': 20, 'message': 'Story text generated successfully!', 'step': 'text_generation'})

            # Determine the number of images based on story length (number of paragraphs)
            num_paragraphs = len([p for p in story.split('\n\n') if p.strip()])
            image_count = max(5, min(20, num_paragraphs))  # Clamp between 5 and 20
            logger.info(f"Story has {num_paragraphs} paragraphs, planning to generate {image_count} images.")

            # Step 2: Audio generation (20-40%)
            self.update_state(state='PROGRESS', meta={'progress': 25, 'message': 'Generating audio narration...', 'step': 'audio_generation'})
            audio_path, audio_duration = loop.run_until_complete(pipeline.generate_audio_from_text(story, voice, language))
            self.update_state(state='PROGRESS', meta={'progress': 40, 'message': 'Audio narration completed!', 'step': 'audio_generation'})
            
            # Step 3: Image generation (40-60%)
            self.update_state(state='PROGRESS', meta={'progress': 45, 'message': f'Generating {image_count} images for the story...', 'step': 'image_generation'})
            image_urls = loop.run_until_complete(pipeline.generate_images_ai(topic, subject, story, count=image_count, language=language))
            if not image_urls:
                raise ValueError("Failed to generate or find any images for the story.")
            self.update_state(state='PROGRESS', meta={'progress': 60, 'message': f'Generated {len(image_urls)} images!', 'step': 'image_generation'})

            # Step 4: Image download (60-80%)
            self.update_state(state='PROGRESS', meta={'progress': 65, 'message': 'Downloading images...', 'step': 'image_download'})
            downloaded_images = []
            
            # Create a list of coroutines to run concurrently
            download_tasks = [pipeline.download_image(url, temp_dir_path / f"image_{i}.jpg") for i, url in enumerate(image_urls)]
            results = loop.run_until_complete(asyncio.gather(*download_tasks))
            
            for i, success in enumerate(results):
                if success:
                    downloaded_images.append(str(temp_dir_path / f"image_{i}.jpg"))

            if not downloaded_images:
                raise Exception("Failed to download any images for the video.")
            
            self.update_state(state='PROGRESS', meta={'progress': 80, 'message': f'Downloaded {len(downloaded_images)} images successfully!', 'step': 'image_download'})

            # Step 5: Video creation (80-100%)
            self.update_state(state='PROGRESS', meta={'progress': 85, 'message': 'Creating video with subtitles...', 'step': 'video_creation'})
            video_path = loop.run_until_complete(pipeline.create_video_slideshow(
                audio_path=audio_path,
                audio_duration=audio_duration,
                images=downloaded_images,
                transcript=story,
                task_instance=self
            ))
            
            self.update_state(state='PROGRESS', meta={'progress': 95, 'message': 'Finalizing video...', 'step': 'video_creation'})

            relative_video_path = os.path.join(user_id, "video.mp4")
            logger.info(f"Task {self.request.id} completed. Video available at: {relative_video_path}")
            
            # Return the final result without updating state
            return {
                'status': 'SUCCESS', 
                'video_url': relative_video_path,
                'audio_url': os.path.join(user_id, "audio.mp3"),
                'script': story,
                'images_used': image_urls
            }
            
    finally:
        loop.close()
        if temp_dir_str:
             logger.info(f"Temporary directory {temp_dir_str} and its contents have been removed.")


@router.post("/generate", response_model=TaskCreationResponse, status_code=202)
async def create_generation_task(req: GenerateRequest, user: dict = Depends(get_current_user)):
    """
    Creates a new background task for video generation.
    """
    user_id = user.get("uid", "anonymous")
    if not user_id:
        raise HTTPException(status_code=403, detail="User ID not found in token")

    # Pass the full request data to the Celery task
    task_request_data = req.dict()
    
    task = generate_story_video_task.delay(task_request_data, user_id)
    return TaskCreationResponse(task_id=task.id)

@router.get("/tasks/{task_id}", status_code=200)
async def get_task_status(task_id: str):
    """
    Retrieves the status or result of a Celery task.
    """
    task_result = AsyncResult(task_id, app=celery_app)
    
    response_data = {
        "task_id": task_id,
        "status": task_result.status,
    }

    if task_result.status == 'PROGRESS':
        # For progress updates, return the meta information
        meta = task_result.info or {}
        response_data.update({
            "progress": meta.get("progress", 0),
            "message": meta.get("message", "Processing..."),
            "step": meta.get("step", "unknown")
        })
    elif task_result.successful():
        # Task completed successfully
        result = task_result.get()
        response_data.update({
            "status": "SUCCESS",
            "progress": 100,
            "message": "Video generation completed successfully!",
            "result": result
        })
    elif task_result.failed():
        # Task failed
        try:
            # Try to get the failure info
            task_result.get(propagate=True)
        except Exception as e:
            # Log the real error on the backend
            logger.error(f"Task {task_id} failed with error: {task_result.traceback}")
            response_data.update({
                "status": "FAILURE",
                "progress": 0,
                "message": f"Generation failed: {str(e)}",
                "error": str(e)
            })
    else:
        # Task is pending or in unknown state
        response_data.update({
            "progress": 0,
            "message": "Task is being processed...",
            "step": "pending"
        })
    
    return response_data

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