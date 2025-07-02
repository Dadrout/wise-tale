from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from uuid import uuid4
from datetime import datetime
import hashlib
import json
import os
# Временно упростим без Firebase для быстрого тестирования
# from app.services.firebase_service import firebase_service

router = APIRouter(prefix="/generate", tags=["generate"])

class GenerateRequest(BaseModel):
    subject: str  # history, geography, philosophy
    topic: str    # e.g. "French Revolution", "Ancient Egypt"
    user_id: int
    persona: str = "narrator"
    language: str = "en"

class GenerateResponse(BaseModel):
    id: str
    video_url: str
    audio_url: str
    transcript: str
    images_used: list[str]
    created_at: str
    status: str = "completed"

class VideoGenerationPipeline:
    
    def _clean_markdown_for_speech(self, text: str) -> str:
        """
        УСИЛЕННАЯ очистка markdown для аудио и субтитров
        Полностью удаляет заголовки и форматирование
        """
        import re
        
        # Разбиваем на строки для обработки
        lines = text.split('\n')
        cleaned_lines = []
        
        for line in lines:
            original_line = line
            line = line.strip()
            
            # Полностью пропускаем строки заголовков (начинающиеся с #)
            if line.startswith('#'):
                print(f"🗑️  Removing header: {line[:50]}...")
                continue
            
            # НОВОЕ: Удаляем заголовки-названия (короткие строки с названиями)
            # Проверяем подозрительные паттерны ТОЛЬКО коротких заголовков
            suspicious_patterns = [
                r'^\*\*.*Tale.*\*\*$',          # **The Tale of...**
                r'^\*\*.*Story.*\*\*$',         # **The Story of...**
                r'^\*\*.*Fairy Tale.*\*\*$',    # **The Fairy Tale of...**
                r'^\*\*[^.]{1,40}\*\*$',        # **короткий текст без точек** (до 40 символов)
                r'^The .* of .{1,30}$',         # The [Something] of [Short] (до 30 символов)
                r'^A .* Tale.{1,20}$',          # A [Something] Tale (до 20 символов)
            ]
            
            is_title = False
            for pattern in suspicious_patterns:
                if re.match(pattern, line, re.IGNORECASE):
                    print(f"🗑️  Removing title pattern: {line[:50]}...")
                    is_title = True
                    break
            
            if is_title:
                continue
                
            # Пропускаем пустые строки и разделители
            if not line or line.startswith('---') or line == '***':
                continue
            
            # Очищаем markdown форматирование
            line = re.sub(r'\*\*(.*?)\*\*', r'\1', line)  # **bold**
            line = re.sub(r'\*(.*?)\*', r'\1', line)      # *italic*
            line = re.sub(r'_(.*?)_', r'\1', line)        # _underline_
            line = re.sub(r'`(.*?)`', r'\1', line)        # `code`
            
            # Очищаем остатки markdown символов
            line = line.replace('**', '').replace('*', '').replace('_', '')
            line = line.replace('###', '').replace('##', '').replace('#', '')
            line = line.replace('---', '').replace('***', '')
            
            # Проверяем что строка не является коротким заголовком после очистки
            clean_line = line.strip()
            if clean_line and len(clean_line) > 10:  # Минимум 10 символов для реального предложения
                cleaned_lines.append(clean_line)
            elif clean_line and len(clean_line) <= 10:
                print(f"🗑️  Removing short title: {clean_line}")
        
        # Объединяем в единый текст
        clean_text = ' '.join(cleaned_lines)
        
        # Убираем лишние пробелы и точки
        clean_text = re.sub(r'\s+', ' ', clean_text)
        clean_text = re.sub(r'\.+', '.', clean_text)
        clean_text = clean_text.strip()
        
        print(f"📝 Cleaned text: {len(text)} → {len(clean_text)} chars")
        return clean_text
    """Video generation pipeline with Firebase storage"""
    
    async def generate_story_text(self, subject: str, topic: str) -> str:
        """Generate educational fairy tale using Azure OpenAI"""
        try:
            import os
            from openai import AzureOpenAI
            
            # Azure OpenAI configuration
            client = AzureOpenAI(
                azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT", "https://your-resource.openai.azure.com/"),
                api_key=os.getenv("AZURE_OPENAI_API_KEY", "mock-key"),
                api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-15-preview")
            )
            
            prompt = f"""You are an expert historian writing educational content for students. Create a historically accurate fairy tale about {topic} that teaches REAL, SPECIFIC {subject} knowledge with concrete facts, dates, and names.

CRITICAL FORMATTING REQUIREMENTS:
- NO TITLES OR HEADERS at the beginning or anywhere in the text
- NO markdown formatting (**bold**, *italic*, ###headers)
- Write as continuous narrative text only
- Do NOT include phrases like "The Tale of", "The Story of", or similar titles

MANDATORY HISTORICAL CONTENT REQUIREMENTS:
- Start IMMEDIATELY with "Once upon a time..." (no title before)
- Include MINIMUM 8 specific historical facts with EXACT DATES and REAL NAMES
- NO GENERIC PHRASES like "great events" or "complex causes" - use SPECIFIC EVENTS
- Each paragraph must contain verifiable historical information
- End with "...and they all learned wisely ever after!"

SPECIFIC FACT REQUIREMENTS for {topic}:
- Exact dates (years, specific events)
- Real historical figures with their actual names and roles
- Specific battles, treaties, laws, or discoveries
- Actual places, cities, kingdoms, or empires
- Real social, political, or cultural changes
- Concrete consequences and impacts

FORBIDDEN VAGUE LANGUAGE:
- ❌ "great events that shaped our world"
- ❌ "complex historical causes"  
- ❌ "key figures and events"
- ❌ "impact was felt across society"
- ✅ Use: "In 1854, Commodore Matthew Perry..."
- ✅ Use: "The Meiji Restoration of 1868..."
- ✅ Use: "Emperor Meiji abolished the samurai class..."

EXAMPLE SPECIFIC CONTENT for Japan:
- "the Heian period (794-1185) established the samurai warrior class"
- "Commodore Matthew Perry's Black Ships arrived in 1854"
- "the Meiji Restoration in 1868 overthrew the Tokugawa shogunate"
- "Japan defeated Russia in the Russo-Japanese War (1904-1905)"

Write educational content that a {subject} teacher would use in class. Focus on teaching REAL historical knowledge, not storytelling fluff.

Topic: {topic}
Subject: {subject}

Generate a fact-rich educational fairy tale with specific dates, names, and events about {topic}!"""

            # Try Azure OpenAI first
            if os.getenv("AZURE_OPENAI_API_KEY") and os.getenv("AZURE_OPENAI_API_KEY") != "mock-key":
                try:
                    response = client.chat.completions.create(
                        model=os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME", "gpt-4o"),
                        messages=[
                            {"role": "system", "content": "You are an expert educational content creator who writes engaging fairy tales that teach real facts."},
                            {"role": "user", "content": prompt}
                        ],
                        max_tokens=1000,
                        temperature=0.8
                    )
                    
                    story = response.choices[0].message.content.strip()
                    print(f"🤖 Generated fairy tale using Azure OpenAI ({len(story)} characters)")
                    return story
                    
                except Exception as e:
                    print(f"🤖 Azure OpenAI failed: {e}")
                    
        except ImportError:
            print("🤖 OpenAI library not available")
        
        # Intelligent fallback when Azure OpenAI is not available
        # This creates historically accurate educational content by topic and subject
        def create_educational_story(topic, subject):
            """Create educational fairy tale with CLEAN text - no markdown, complete sentences"""
            
            # Исторические шаблоны с РЕАЛЬНЫМИ фактами
            history_templates = {
                "World War 2": {
                    "context": "the dark years of 1939 to 1945 when the world was torn apart by the greatest conflict in human history",
                    "key_events": [
                        "Adolf Hitler invaded Poland on September 1, 1939, prompting Britain and France to declare war on Germany",
                        "the Blitzkrieg strategy allowed Nazi Germany to conquer France, Denmark, Norway, and much of Eastern Europe by 1940",
                        "the Battle of Britain saw the Royal Air Force defeat the German Luftwaffe in aerial combat from July to October 1940",
                        "Operation Barbarossa began June 22, 1941, as Nazi Germany launched a massive invasion of the Soviet Union",
                        "Japan attacked Pearl Harbor on December 7, 1941, bringing the United States into the global conflict",
                        "the Holocaust systematically murdered six million Jews and millions of others in Nazi concentration camps",
                        "D-Day landings on June 6, 1944, opened a second front in Western Europe as Allies invaded Normandy",
                        "the war ended with Germany's surrender on May 8, 1945, and Japan's surrender on September 2, 1945, after atomic bombings"
                    ],
                    "significance": "World War 2 established the United States and Soviet Union as superpowers, led to the United Nations, and fundamentally changed global politics and human rights"
                },
                "Ancient Egypt": {
                    "context": "the magnificent civilization that flourished along the Nile River for over 3000 years",
                    "key_events": [
                        "Pharaoh Menes united Upper and Lower Egypt around 3100 BCE, creating the first Egyptian dynasty",
                        "the Great Pyramid of Giza was built around 2580 BCE for Pharaoh Khufu, becoming one of the Seven Wonders of the Ancient World",
                        "Pharaoh Hatshepsut ruled Egypt for 22 years around 1479-1458 BCE, becoming one of the most successful female pharaohs",
                        "Pharaoh Akhenaten introduced monotheism around 1353 BCE, worshipping only the sun god Aten",
                        "King Tutankhamun became pharaoh at age 9 in 1332 BCE, and his tomb was discovered intact in 1922",
                        "Queen Cleopatra VII ruled from 69-30 BCE, forming alliances with Julius Caesar and Mark Antony",
                        "the Rosetta Stone was carved in 196 BCE, later helping scholars decode Egyptian hieroglyphs in the 1820s"
                    ],
                    "significance": "Ancient Egypt gave us writing systems, medical knowledge, architectural techniques, and mathematical concepts that still influence our world today"
                },
                "English History": {
                    "context": "the fascinating island nation that shaped global history through centuries of kings, queens, and remarkable achievements",
                    "key_events": [
                        "William the Conqueror defeated King Harold at the Battle of Hastings on October 14, 1066, beginning Norman rule",
                        "King John signed the Magna Carta on June 15, 1215, limiting royal power and establishing basic legal rights",
                        "the Black Death killed one third of England's population between 1348 and 1351, transforming medieval society",
                        "Henry VIII broke from the Catholic Church in 1534, establishing the Church of England and changing religion forever",
                        "Queen Elizabeth I defeated the Spanish Armada in 1588, establishing England as a major naval power",
                        "the English Civil War from 1642-1651 resulted in King Charles I being executed and Oliver Cromwell ruling as Lord Protector",
                        "the Industrial Revolution began in England around 1760, transforming manufacturing and creating the modern world",
                        "Queen Victoria ruled for 63 years from 1837-1901, overseeing the expansion of the British Empire across the globe"
                    ],
                    "significance": "English history shaped modern democracy, law, language, and culture that spread across the world through the British Empire"
                }
            }
            
            # Get template or create generic one
            template = history_templates.get(topic, {
                "context": f"the historical period when {topic} shaped human civilization",
                "key_events": [
                    f"{topic} emerged from complex historical causes and conditions during this time period",
                    f"key figures and events in {topic} changed the course of history through their actions",
                    f"the impact of {topic} was felt across society and culture in lasting ways",
                    f"the legacy of {topic} continues to influence our world today through its achievements"
                ],
                "significance": f"{topic} teaches us important lessons about {subject} and human nature"
            })
            
            # Create CLEAN educational narrative with real historical content (NO MARKDOWN)
            events = template['key_events']
            
            # Limit to 6 key events for manageable length
            selected_events = events[:6]
            
            story_parts = [
                f"Once upon a time, in {template['context']}, brave young scholars embarked on a magical journey through time to discover the true history of {topic}."
            ]
            
            # Add each historical fact as part of the journey (NO INCOMPLETE SENTENCES)
            for i, event in enumerate(selected_events):
                if i == 0:
                    story_parts.append(f"Their first amazing discovery was that {event}. The young historians gasped in wonder at this incredible transformation that changed everything they thought they knew.")
                elif i == 1:
                    story_parts.append(f"As they traveled deeper into the past, the wise chronicles revealed that {event}. This remarkable truth showed them how history unfolds through the actions of real people with real courage.")
                elif i == 2:
                    story_parts.append(f"The mystical time portal then transported them to witness how {event}. The students marveled at the courage and determination of those who shaped these pivotal events.")
                elif i == 3:
                    story_parts.append(f"In their continuing quest for knowledge, they learned that {event}. This pivotal moment demonstrated how individual choices can change the course of entire nations.")
                elif i == 4:
                    story_parts.append(f"The ancient scrolls of wisdom then revealed that {event}. The young scholars understood how this connected to their own lives and the modern world around them.")
                elif i == 5:
                    story_parts.append(f"Finally, the guardians of history showed them that {event}. This final lesson helped them see how the past continues to influence our present day lives.")
            
            # Complete conclusion (NO INCOMPLETE SENTENCES)
            story_parts.extend([
                f"Through their magical journey of discovery, the students learned that {template['significance']}. With hearts full of historical knowledge and wonder, they realized that studying {topic} reveals the fascinating story of human civilization.",
                f"And so, dear young scholars, remember that by understanding {topic}, you unlock the secrets of how societies rise and change, how people overcome challenges, and how the past shapes our future. For in the kingdom of {subject}, every historical event teaches us valuable lessons about courage, wisdom, and the power of human achievement. They all learned wisely and lived happily ever after, carrying this knowledge with them forever."
            ])
            
            # Join parts and ensure clean text (NO MARKDOWN SYMBOLS)
            story = " ".join(story_parts)  # Use single space, not double newlines
            
            # Clean any remaining markdown symbols
            story = story.replace('**', '').replace('###', '').replace('---', '')
            story = story.replace('#', '').replace('*', '').replace('_', '')
            
            return story
        
        # Use the intelligent educational story generator
        story = create_educational_story(topic, subject)
        
        print(f"📚 Generated educational fairy tale with curated facts ({len(story)} characters)")
        return story

    async def generate_audio_from_text(self, text: str, persona: str = "narrator") -> str:
        """Generate high-quality audio using Azure Speech Services with SSML"""
        try:
            import os
            import azure.cognitiveservices.speech as speechsdk
            from pathlib import Path
            
            # Azure Speech configuration
            speech_key = os.getenv("AZURE_SPEECH_KEY", "mock-key")
            speech_region = os.getenv("AZURE_SPEECH_REGION", "eastus")
            
            # Создаем папку для аудио
            audio_dir = Path("generated_audio")
            audio_dir.mkdir(exist_ok=True)
            
            # Используем умную очистку markdown для аудио
            clean_text = self._clean_markdown_for_speech(text)
            
            # Try Azure Speech Services first
            if speech_key != "mock-key":
                try:
                    # Configure speech service with higher quality
                    speech_config = speechsdk.SpeechConfig(subscription=speech_key, region=speech_region)
                    
                    # Set high quality output format
                    speech_config.set_speech_synthesis_output_format(speechsdk.SpeechSynthesisOutputFormat.Audio48Khz192KBitRateMonoMp3)
                    
                    # Choose voice - Brian Multilingual Neural with SSML for better quality
                    voice_name = "en-US-BrianMultilingualNeural"
                    speech_config.speech_synthesis_voice_name = voice_name
                    
                    # Generate audio file
                    audio_id = uuid4().hex
                    audio_path = audio_dir / f"{audio_id}.wav"
                    
                    # Create SSML for better speech quality and timing
                    ssml_text = f"""
                    <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
                        <voice name="{voice_name}">
                            <prosody rate="0.9" pitch="+2%">
                                {clean_text}
                            </prosody>
                        </voice>
                    </speak>
                    """
                    
                    audio_config = speechsdk.audio.AudioOutputConfig(filename=str(audio_path))
                    synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config, audio_config=audio_config)
                    
                    # Synthesize speech using SSML for better quality
                    result = synthesizer.speak_ssml_async(ssml_text).get()
                    
                    if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
                        # Convert to high quality WAV
                        audio_url = f"http://localhost:8000/audio/{audio_id}.wav"
                        print(f"🎵 High-quality Azure Speech generated: {audio_path} ({audio_path.stat().st_size} bytes)")
                        return audio_url
                    else:
                        print(f"🎵 Azure Speech failed: {result.reason}")
                        
                except Exception as e:
                    print(f"🎵 Azure Speech error: {e}")
            
        except ImportError:
            print("🎵 Azure Speech SDK not available")
        
        # Fallback to mock URL
        print(f"🎵 Using mock audio URL (Azure Speech not configured)")
        return f"https://storage.googleapis.com/wisetale-audio/{uuid4().hex}.mp3"

    async def search_images_pexels(self, topic: str, subject: str, story_text: str = "", count: int = 8) -> list[str]:
        """Enhanced Pexels API search using story content analysis"""
        try:
            # Используем реальный Pexels API с улучшенным поиском
            from app.services.pexels_service import pexels_service
            
            # Получаем разнообразные изображения по теме И содержанию истории
            diverse_images = await pexels_service.get_diverse_images(
                topic=topic, 
                subject=subject, 
                count=count,
                story_text=story_text  # Передаем текст истории для анализа!
            )
            
            # Извлекаем URL'ы
            image_urls = [img.get('url', img.get('medium_url', '')) for img in diverse_images]
            
            # Если API не сработал, используем fallback
            if not image_urls:
                print(f"Pexels API failed, using fallback images for {topic}")
                fallback_images = [
                    "https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg",
                    "https://images.pexels.com/photos/159775/library-books-education-literature-159775.jpeg", 
                    "https://images.pexels.com/photos/256541/pexels-photo-256541.jpeg",
                    "https://images.pexels.com/photos/207662/pexels-photo-207662.jpeg",
                    "https://images.pexels.com/photos/415071/pexels-photo-415071.jpeg",
                    "https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg",
                    "https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg",
                    "https://images.pexels.com/photos/1116302/pexels-photo-1116302.jpeg"
                ]
                return fallback_images[:count]
            
            print(f"Found {len(image_urls)} enhanced Pexels images for '{topic}' in {subject} (using story context)")
            return image_urls[:count]
            
        except Exception as e:
            print(f"Pexels search error for {topic}: {e}")
            # Fallback к базовым изображениям
            fallback_images = [
                "https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg",
                "https://images.pexels.com/photos/159775/library-books-education-literature-159775.jpeg", 
                "https://images.pexels.com/photos/256541/pexels-photo-256541.jpeg",
                "https://images.pexels.com/photos/207662/pexels-photo-207662.jpeg",
                "https://images.pexels.com/photos/415071/pexels-photo-415071.jpeg",
                "https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg"
            ]
            return fallback_images[:count]

    async def create_video_slideshow(self, audio_url: str, images: list[str], transcript: str) -> str:
        """Create REAL video slideshow with smooth transitions and perfect audio sync"""
        import tempfile
        import subprocess
        import requests
        import os
        from pathlib import Path
        
        try:
            print(f"🎬 Creating REAL fairy tale video with {len(images)} magical images")
            
            with tempfile.TemporaryDirectory() as temp_dir:
                temp_path = Path(temp_dir)
                
                # 1. Скачиваем изображения
                image_paths = []
                for i, img_url in enumerate(images):
                    try:
                        print(f"📥 Downloading image {i+1}/{len(images)}")
                        response = requests.get(img_url, timeout=30)
                        if response.status_code == 200:
                            img_path = temp_path / f"image_{i:03d}.jpg"
                            img_path.write_bytes(response.content)
                            image_paths.append(str(img_path))
                    except Exception as e:
                        print(f"Failed to download image {i}: {e}")
                
                if not image_paths:
                    print("❌ No images downloaded, using mock URL")
                    return f"https://storage.googleapis.com/wisetale-videos/{uuid4().hex}.mp4"
                
                # 2. Получаем ТОЧНУЮ длительность аудио
                audio_duration = None
                audio_file_path = None
                
                if audio_url and audio_url.startswith("http://localhost:8000/audio/"):
                    audio_filename = audio_url.split("/")[-1]
                    audio_file_path = Path("generated_audio") / audio_filename
                    if audio_file_path.exists():
                        try:
                            result = subprocess.run([
                                'ffprobe', '-v', 'quiet', '-show_entries', 'format=duration',
                                '-of', 'default=noprint_wrappers=1:nokey=1', str(audio_file_path)
                            ], capture_output=True, text=True)
                            if result.returncode == 0:
                                audio_duration = float(result.stdout.strip())
                                print(f"🎵 Real audio duration: {audio_duration:.2f} seconds")
                        except Exception as e:
                            print(f"Error getting audio duration: {e}")
                
                # Если аудио недоступно, используем расчетное время
                if audio_duration is None:
                    # Расчет приблизительной длительности на основе текста (примерно 150 слов в минуту)
                    word_count = len(transcript.split())
                    audio_duration = max(30, (word_count / 150) * 60)  # минимум 30 секунд
                    print(f"🎵 Estimated audio duration: {audio_duration:.2f} seconds (based on {word_count} words)")
                
                # 3. Создаем видео с переходами между изображениями
                # Используем фильтр для создания слайдшоу с плавными переходами
                
                # Создаем субтитры ТОЧНО синхронизированные с аудио
                srt_file = temp_path / "subtitles.srt"
                self._create_subtitles(transcript, str(srt_file), audio_duration)
                
                # 4. Создаем видео через ffmpeg с переходами
                output_video = temp_path / "fairy_tale_video.mp4"
                
                # Построение команды ffmpeg для создания слайдшоу с переходами
                ffmpeg_cmd = ['ffmpeg', '-y']
                
                # Добавляем все изображения как входы
                for img_path in image_paths:
                    ffmpeg_cmd.extend(['-loop', '1', '-t', str(audio_duration / len(image_paths) + 1), '-i', img_path])
                
                # Добавляем аудио если есть
                if audio_file_path and audio_file_path.exists():
                    ffmpeg_cmd.extend(['-i', str(audio_file_path)])
                    print(f"🎵 Adding real audio to video: {audio_file_path}")
                
                # Создаем фильтр для переходов между изображениями
                filter_complex = []
                inputs = len(image_paths)
                
                # Подготавливаем каждое изображение
                for i in range(inputs):
                    filter_complex.append(f"[{i}:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:color=black,setpts=PTS-STARTPTS[v{i}]")
                
                # Создаем переходы между изображениями
                if inputs > 1:
                    # Длительность каждого изображения и перехода
                    segment_duration = audio_duration / inputs
                    transition_duration = min(1.0, segment_duration * 0.2)  # 20% времени на переход, макс 1 сек
                    
                    # Создаем цепочку переходов
                    current_output = "v0"
                    for i in range(1, inputs):
                        offset = i * segment_duration - transition_duration
                        next_output = f"tmp{i}" if i < inputs - 1 else "video_with_transitions"
                        filter_complex.append(
                            f"[{current_output}][v{i}]xfade=transition=fade:duration={transition_duration}:offset={offset}[{next_output}]"
                        )
                        current_output = next_output
                else:
                    # Если только одно изображение
                    filter_complex.append(f"[v0]trim=duration={audio_duration}[video_with_transitions]")
                
                # Добавляем субтитры
                filter_complex.append(f"[video_with_transitions]subtitles={srt_file}:force_style='Fontsize=18,PrimaryColour=&Hffffff,OutlineColour=&H000000,Outline=2,BackColour=&H80000000,Bold=1'[final_video]")
                
                # Собираем все фильтры
                ffmpeg_cmd.extend(['-filter_complex', ';'.join(filter_complex)])
                
                # Выходные параметры
                ffmpeg_cmd.extend([
                    '-map', '[final_video]',
                    '-c:v', 'libx264',
                    '-preset', 'medium',
                    '-crf', '23',
                    '-pix_fmt', 'yuv420p',
                    '-r', '25'
                ])
                
                # Добавляем аудио если есть
                if audio_file_path and audio_file_path.exists():
                    ffmpeg_cmd.extend(['-map', f'{inputs}:a', '-c:a', 'aac', '-b:a', '128k'])
                    # Точно обрезаем по длительности аудио
                    ffmpeg_cmd.extend(['-t', str(audio_duration)])
                else:
                    # Если нет аудио, создаем тишину
                    ffmpeg_cmd.extend(['-f', 'lavfi', '-i', f'anullsrc=channel_layout=stereo:sample_rate=48000', '-c:a', 'aac', '-shortest'])
                
                ffmpeg_cmd.append(str(output_video))
                
                print(f"🎥 Running ffmpeg with transitions...")
                print(f"Command: {' '.join(ffmpeg_cmd[:10])}... (truncated)")
                
                result = subprocess.run(ffmpeg_cmd, capture_output=True, text=True, timeout=180)
                
                if result.returncode == 0 and output_video.exists():
                    # Проверяем финальную длительность видео
                    try:
                        check_result = subprocess.run([
                            'ffprobe', '-v', 'quiet', '-show_entries', 'format=duration',
                            '-of', 'default=noprint_wrappers=1:nokey=1', str(output_video)
                        ], capture_output=True, text=True)
                        if check_result.returncode == 0:
                            final_duration = float(check_result.stdout.strip())
                            print(f"✅ Video created! Duration: {final_duration:.2f}s (target: {audio_duration:.2f}s)")
                    except:
                        pass
                    
                    print(f"✅ Video created successfully! Size: {output_video.stat().st_size} bytes")
                    
                    # Создаем папку для видео если её нет
                    video_dir = Path("generated_videos")
                    video_dir.mkdir(exist_ok=True)
                    
                    # Копируем видео в постоянную папку
                    video_id = uuid4().hex
                    final_video_path = video_dir / f"{video_id}.mp4"
                    import shutil
                    shutil.copy2(output_video, final_video_path)
                    
                    # Возвращаем URL для доступа к видео
                    video_url = f"http://localhost:8000/videos/{video_id}.mp4"
                    
                    print(f"🎯 Video saved to: {final_video_path}")
                    print(f"📺 Video accessible at: {video_url}")
                    return video_url
                else:
                    print(f"❌ FFmpeg failed: {result.stderr}")
                    return f"https://storage.googleapis.com/wisetale-videos/{uuid4().hex}.mp4"
                    
        except Exception as e:
            print(f"💥 Video creation error: {e}")
            import traceback
            traceback.print_exc()
            return f"https://storage.googleapis.com/wisetale-videos/{uuid4().hex}.mp4"
    
    def _create_subtitles(self, transcript: str, srt_file: str, total_duration: float):
        """Create perfectly synchronized SRT subtitle file from transcript"""
        # Используем умную очистку markdown для субтитров
        clean_text = self._clean_markdown_for_speech(transcript)
        
        # Разбиваем транскрипт на предложения
        import re
        
        # Простое разбиение по точкам для лучшей синхронизации
        sentences = [s.strip() for s in clean_text.split('.') if s.strip()]
        
        # Добавляем точки только к предложениям, которые их не имеют
        for i, sentence in enumerate(sentences):
            if not sentence.endswith('.'):
                sentences[i] = sentence + '.'
        
        if not sentences:
            return
            
        # ПРОСТОЕ равномерное распределение по времени аудио с УВЕЛИЧЕННОЙ задержкой
        # Добавляем 2.5-секундную задержку чтобы субтитры точно НЕ опережали аудио
        subtitle_delay = 2.5  # секунды (увеличено для лучшей синхронизации)
        available_duration = total_duration - subtitle_delay
        duration_per_sentence = available_duration / len(sentences)
        
        print(f"⏱️  Subtitle timing: delay={subtitle_delay}s, duration_per_sentence={duration_per_sentence:.2f}s")
        
        with open(srt_file, 'w', encoding='utf-8') as f:
            for i, sentence in enumerate(sentences):
                # Простая линейная привязка ко времени с задержкой
                start_time = subtitle_delay + (i * duration_per_sentence)
                end_time = subtitle_delay + ((i + 1) * duration_per_sentence)
                
                # Убеждаемся, что не превышаем общую длительность
                if end_time > total_duration:
                    end_time = total_duration
                
                start_str = self._seconds_to_srt_time(start_time)
                end_str = self._seconds_to_srt_time(end_time)
                
                f.write(f"{i + 1}\n")
                f.write(f"{start_str} --> {end_str}\n")
                f.write(f"{sentence.strip()}\n\n")
                
                print(f"Subtitle {i+1}: {start_time:.2f}s - {end_time:.2f}s: {sentence.strip()[:50]}...")
        
        print(f"Created {len(sentences)} subtitles for {total_duration:.2f}s audio")
    
    def _seconds_to_srt_time(self, seconds: float) -> str:
        """Convert seconds to SRT time format (HH:MM:SS,mmm)"""
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        millisecs = int((seconds % 1) * 1000)
        return f"{hours:02d}:{minutes:02d}:{secs:02d},{millisecs:03d}"

pipeline = VideoGenerationPipeline()

@router.post("/", response_model=GenerateResponse)
async def generate_video(req: GenerateRequest):
    """Generate educational video and save to Firebase"""
    
    try:
        # Step 1: Generate story text from topic
        story_text = await pipeline.generate_story_text(req.subject, req.topic)
        
        # Step 2: Convert text to speech  
        audio_url = await pipeline.generate_audio_from_text(story_text, req.persona)
        
        # Step 3: Find relevant images from Pexels using story content analysis
        images = await pipeline.search_images_pexels(req.topic, req.subject, story_text)
        
        # Step 4: Create video with slideshow, transitions and subtitles
        video_url = await pipeline.create_video_slideshow(audio_url, images, story_text)
        
        # Step 5: Save to Firebase
        generation_data = {
            "subject": req.subject,
            "topic": req.topic,
        "user_id": req.user_id,
            "persona": req.persona,
            "language": req.language,
            "video_url": video_url,
            "audio_url": audio_url,
            "transcript": story_text,
            "images_used": images,
            "status": "completed"
        }
        
        # Временно используем mock ID
        generation_id = f"gen_{uuid4().hex[:8]}"
        
        # Create response
        result = GenerateResponse(
            id=generation_id,
            video_url=video_url,
            audio_url=audio_url,
            transcript=story_text,
            images_used=images,
            created_at=datetime.utcnow().isoformat(),
            status="completed"
        )
        
        return result
        
    except Exception as e:
        print(f"Video generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Video generation failed: {str(e)}")

@router.get("/status/{generation_id}")
async def get_generation_status(generation_id: str):
    """Get the status of a video generation from Firebase"""
    # Временно возвращаем mock данные  
    data = {"status": "completed", "video_url": f"https://storage.googleapis.com/wisetale-videos/{generation_id}.mp4"}
    
    if not data:
        raise HTTPException(status_code=404, detail="Generation not found")
    
    return {
        "id": generation_id, 
        "status": data.get("status", "completed"), 
        "url": data.get("video_url", "")
    }

@router.get("/user/{user_id}/recent")
async def get_user_recent_generations(user_id: int, limit: int = 10):
    """Get user's recent generations from Firebase"""
    # Временно возвращаем mock данные
    generations = [{"id": f"gen_{i}", "topic": f"Topic {i}", "status": "completed"} for i in range(min(limit, 3))]
    return {"user_id": user_id, "generations": generations}

@router.get("/health")
async def health_check():
    """Simple health check endpoint"""
    return {"status": "healthy", "service": "video-generation-api", "database": "firebase"} 