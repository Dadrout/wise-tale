"""
Pexels API service for image search and management
"""
import os
import requests
import json
from typing import List, Dict, Optional
import hashlib
import re
from app.core.config import settings

class PexelsService:
    """
    Pexels API Service for finding fallback images.
    """
    def __init__(self):
        self.base_url = "https://api.pexels.com/v1"
        self.api_key = settings.PEXELS_API_KEY
        if not self.api_key:
            print("⚠️ PEXELS_API_KEY not found. Pexels API will not be available.")

    def _get_headers(self):
        if not self.api_key:
            return {}
        return {
            "Authorization": self.api_key
        }

    def extract_keywords_from_story(self, story_text: str, subject: str) -> List[str]:
        """
        Извлекает ключевые слова и фразы из сгенерированной истории
        для более точного поиска изображений
        """
        keywords = []
        
        # Очищаем текст от markdown и лишних символов
        clean_text = story_text.replace('**', '').replace('###', '').replace('---', '')
        clean_text = clean_text.replace('##', '').replace('#', '').replace('*', '').replace('_', '')
        
        # Ключевые слова для истории
        if subject.lower() == "history":
            historical_keywords = [
                # Общие исторические термины
                'empire', 'kingdom', 'civilization', 'ancient', 'medieval', 'renaissance',
                'war', 'battle', 'revolution', 'conquest', 'dynasty', 'emperor', 'king', 'queen',
                'castle', 'fortress', 'palace', 'cathedral', 'temple', 'monument',
                'army', 'soldiers', 'weapons', 'armor', 'sword', 'shield',
                'artifact', 'manuscript', 'document', 'scroll', 'ruins',
                
                # Временные периоды
                'BC', 'AD', 'century', 'era', 'age', 'period',
                
                # Исторические личности и роли
                'pharaoh', 'caesar', 'general', 'philosopher', 'scholar', 'priest',
                
                # Географические термины
                'rome', 'egypt', 'greece', 'constantinople', 'jerusalem', 'babylon',
                'mediterranean', 'nile', 'tiber', 'danube',
                
                # Культурные элементы
                'culture', 'religion', 'mythology', 'gods', 'goddess', 'ritual',
                'art', 'sculpture', 'painting', 'architecture', 'column'
            ]
            
            # Ищем исторические ключевые слова в тексте
            for keyword in historical_keywords:
                if keyword.lower() in clean_text.lower():
                    keywords.append(keyword)
        
        elif subject.lower() == "geography":
            geo_keywords = [
                'mountain', 'river', 'ocean', 'sea', 'desert', 'forest', 'valley', 'canyon',
                'continent', 'island', 'peninsula', 'plateau', 'plain', 'coast', 'beach',
                'volcano', 'glacier', 'lake', 'waterfall', 'cave', 'cliff',
                'city', 'capital', 'country', 'nation', 'border', 'region',
                'climate', 'weather', 'landscape', 'terrain', 'natural', 'environment'
            ]
            
            for keyword in geo_keywords:
                if keyword.lower() in clean_text.lower():
                    keywords.append(keyword)
        
        elif subject.lower() == "philosophy":
            phil_keywords = [
                'wisdom', 'knowledge', 'truth', 'ethics', 'morality', 'logic', 'reason',
                'thought', 'mind', 'consciousness', 'existence', 'reality', 'universe',
                'book', 'library', 'scroll', 'manuscript', 'writing', 'text',
                'scholar', 'thinker', 'sage', 'student', 'teacher', 'academy',
                'meditation', 'contemplation', 'reflection', 'debate', 'discussion'
            ]
            
            for keyword in phil_keywords:
                if keyword.lower() in clean_text.lower():
                    keywords.append(keyword)
        
        # Извлекаем имена собственные (начинающиеся с заглавной буквы)
        proper_nouns = re.findall(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b', clean_text)
        
        # Фильтруем общие слова
        common_words = {'The', 'This', 'That', 'These', 'Those', 'When', 'Where', 'Why', 'How', 'What', 'Who'}
        proper_nouns = [noun for noun in proper_nouns if noun not in common_words and len(noun) > 2]
        
        keywords.extend(proper_nouns[:5])  # Берем до 5 имен собственных
        
        # Извлекаем важные числа (годы, века)
        years = re.findall(r'\b(?:1\d{3}|2\d{3})\b', clean_text)  # 1000-2999
        centuries = re.findall(r'\b\d{1,2}(?:st|nd|rd|th)\s+century\b', clean_text.lower())
        
        if years:
            keywords.extend([f"year {year}" for year in years[:2]])
        if centuries:
            keywords.extend(centuries[:2])
        
        # Удаляем дубликаты и возвращаем уникальные ключевые слова
        return list(set(keywords))

    async def search_images(self, query: str, per_page: int = 10, orientation: str = "landscape") -> List[Dict]:
        """
        Search for images on Pexels
        Args:
            query: Search term (e.g., "French Revolution", "Ancient Egypt")
            per_page: Number of images to return (max 80)
            orientation: "landscape", "portrait", or "square"
        Returns:
            List of image data dictionaries
        """
        params = {
            "query": query,
            "per_page": min(per_page, 80),  # Pexels max is 80
            "orientation": orientation,
            "size": "medium"
        }
        
        try:
            response = requests.get(
                f"{self.base_url}/search",
                headers=self._get_headers(),
                params=params,
                timeout=30
            )
            response.raise_for_status()
            
            data = response.json()
            photos = data.get("photos", [])
            
            # Process images for our use case
            processed_images = []
            for photo in photos:
                processed_images.append({
                    "id": photo["id"],
                    "url": photo["src"]["large"],
                    "medium_url": photo["src"]["medium"],
                    "small_url": photo["src"]["small"],
                    "photographer": photo["photographer"],
                    "photographer_url": photo["photographer_url"],
                    "alt": photo.get("alt", query),
                    "width": photo["width"],
                    "height": photo["height"]
                })
            
            return processed_images
            
        except requests.RequestException as e:
            print(f"Pexels API error: {str(e)}")
            return []
    
    async def search_curated_images(self, per_page: int = 10) -> List[Dict]:
        """Get curated photos from Pexels"""
        params = {"per_page": min(per_page, 80)}
        
        try:
            response = requests.get(
                f"{self.base_url}/curated",
                headers=self._get_headers(),
                params=params,
                timeout=30
            )
            response.raise_for_status()
            
            data = response.json()
            photos = data.get("photos", [])
            
            processed_images = []
            for photo in photos:
                processed_images.append({
                    "id": photo["id"],
                    "url": photo["src"]["large"],
                    "medium_url": photo["src"]["medium"],
                    "small_url": photo["src"]["small"],
                    "photographer": photo["photographer"],
                    "photographer_url": photo["photographer_url"],
                    "alt": photo.get("alt", "Curated photo"),
                    "width": photo["width"],
                    "height": photo["height"]
                })
            
            return processed_images
            
        except requests.RequestException as e:
            print(f"Pexels API error: {str(e)}")
            return []
    
    def get_smart_search_terms(self, topic: str, subject: str) -> List[str]:
        """
        Generate multiple search terms for better image diversity
        """
        base_terms = [topic.lower()]
        
        # Subject-specific terms
        if subject.lower() == "history":
            additional_terms = [
                f"{topic} historical",
                f"{topic} ancient",
                f"{topic} civilization",
                f"{topic} culture",
                "historical artifacts",
                "old documents",
                "antique objects"
            ]
        elif subject.lower() == "geography":
            additional_terms = [
                f"{topic} landscape",
                f"{topic} nature",
                f"{topic} geography",
                f"{topic} map",
                "world map",
                "mountains",
                "rivers",
                "cities"
            ]
        elif subject.lower() == "philosophy":
            additional_terms = [
                f"{topic} philosophy",
                f"{topic} thinking",
                "books",
                "library",
                "wisdom",
                "meditation",
                "contemplation",
                "ancient philosophy"
            ]
        else:
            additional_terms = [f"{topic} education", f"{topic} learning"]
        
        return base_terms + additional_terms[:4]  # Limit to 5 total terms
    
    def get_enhanced_search_terms(self, topic: str, subject: str, story_text: Optional[str] = None) -> List[str]:
        """
        Генерирует расширенный список поисковых запросов на основе темы, предмета и содержания истории
        """
        search_terms = []
        
        # Базовые термины
        base_terms = [topic.lower()]
        
        # Добавляем ключевые слова из истории если она предоставлена
        if story_text:
            story_keywords = self.extract_keywords_from_story(story_text, subject)
            # Комбинируем тему с ключевыми словами
            for keyword in story_keywords[:8]:  # Берем топ-8 ключевых слов
                search_terms.append(f"{topic} {keyword}")
                search_terms.append(keyword)
        
        # Предметно-специфичные термины
        if subject.lower() == "history":
            additional_terms = [
                f"{topic} historical",
                f"{topic} ancient",
                f"{topic} medieval",
                f"{topic} civilization",
                f"{topic} culture",
                f"{topic} empire",
                f"{topic} archaeological",
                "historical artifacts",
                "ancient architecture",
                "historical documents",
                "medieval art",
                "ancient sculptures",
                "historical paintings",
                "old manuscripts",
                "antique objects",
                "historical sites",
                "ancient ruins"
            ]
        elif subject.lower() == "geography":
            additional_terms = [
                f"{topic} landscape",
                f"{topic} nature",
                f"{topic} geography",
                f"{topic} terrain",
                f"{topic} environment",
                f"{topic} map",
                f"{topic} satellite",
                "world map",
                "topographic map",
                "mountains",
                "rivers",
                "forests",
                "cities",
                "natural landscape",
                "aerial view",
                "satellite image"
            ]
        elif subject.lower() == "philosophy":
            additional_terms = [
                f"{topic} philosophy",
                f"{topic} thinking",
                f"{topic} wisdom",
                f"{topic} scholar",
                "ancient philosophy",
                "philosophical books",
                "library",
                "wisdom",
                "meditation",
                "contemplation",
                "ancient texts",
                "scrolls",
                "philosophical art",
                "thinking statue",
                "ancient library"
            ]
        else:
            additional_terms = [f"{topic} education", f"{topic} learning", f"{topic} academic"]
        
        # Объединяем все термины
        all_terms = base_terms + search_terms + additional_terms
        
        # Удаляем дубликаты и ограничиваем количество
        unique_terms = []
        seen = set()
        for term in all_terms:
            if term.lower() not in seen and len(term) > 2:
                unique_terms.append(term)
                seen.add(term.lower())
        
        return unique_terms[:15]  # Максимум 15 поисковых запросов

    async def get_diverse_images(self, topic: str, subject: str, count: int = 8, story_text: Optional[str] = None) -> List[Dict]:
        """
        Получает разнообразный набор изображений используя множественные поисковые запросы
        и анализ содержания истории
        """
        search_terms = self.get_enhanced_search_terms(topic, subject, story_text)
        all_images = []
        
        print(f"🔍 Searching with {len(search_terms)} enhanced terms for '{topic}' in {subject}")
        
        # Ищем по несколько изображений для каждого запроса
        images_per_search = max(2, count // len(search_terms) + 1)
        
        for i, term in enumerate(search_terms):
            try:
                images = await self.search_images(term, per_page=images_per_search)
                all_images.extend(images)
                print(f"  📸 Term '{term}': found {len(images)} images")
                
                # Если собрали достаточно изображений, прекращаем поиск
                if len(all_images) >= count * 2:  # Собираем больше для лучшего выбора
                    break
                    
            except Exception as e:
                print(f"  ❌ Search failed for '{term}': {e}")
                continue
        
        # Удаляем дубликаты по ID и выбираем лучшие
        seen_ids = set()
        unique_images = []
        
        for image in all_images:
            if image["id"] not in seen_ids:
                seen_ids.add(image["id"])
                unique_images.append(image)
        
        print(f"📊 Total unique images found: {len(unique_images)}, requested: {count}")
        
        # Если изображений мало, добавляем fallback поиски
        if len(unique_images) < count:
            fallback_terms = [
                f"{subject} education",
                f"{subject} learning", 
                "historical education" if subject == "history" else f"{subject} academic",
                "educational content"
            ]
            
            for term in fallback_terms:
                if len(unique_images) >= count:
                    break
                try:
                    fallback_images = await self.search_images(term, per_page=3)
                    for img in fallback_images:
                        if img["id"] not in seen_ids and len(unique_images) < count:
                            seen_ids.add(img["id"])
                            unique_images.append(img)
                except:
                    continue
        
        return unique_images[:count]

# Global instance
pexels_service = PexelsService() 