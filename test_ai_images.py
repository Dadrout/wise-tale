#!/usr/bin/env python3
"""
Тестовый скрипт для проверки API генерации видео с AI изображениями
"""

import requests
import json
import time

# Конфигурация
API_BASE_URL = "http://localhost:8000"

def test_ai_image_generation():
    """Тестируем генерацию видео с AI изображениями"""
    
    print("🧪 Тестируем генерацию видео с AI изображениями через Hugging Face")
    print("=" * 60)
    
    # Данные для тестирования
    test_data = {
        "subject": "history",
        "topic": "Ancient Egypt",
        "persona": "narrator",
        "language": "en",
        "user_id": 1
    }
    
    print(f"📝 Отправляем запрос на генерацию:")
    print(f"   Тема: {test_data['topic']}")
    print(f"   Предмет: {test_data['subject']}")
    print()
    
    try:
        # Отправляем запрос
        response = requests.post(
            f"{API_BASE_URL}/api/v1/generate",
            json=test_data,
            timeout=120  # 2 минуты таймаут
        )
        
        if response.status_code == 200:
            result = response.json()
            
            print("✅ Успешно сгенерировано!")
            print(f"🎬 Видео URL: {result.get('video_url', 'N/A')}")
            print(f"🎵 Аудио URL: {result.get('audio_url', 'N/A')}")
            print(f"📖 Транскрипт: {result.get('transcript', 'N/A')[:100]}...")
            print(f"🖼️  Изображения ({len(result.get('images_used', []))}):")
            
            for i, img in enumerate(result.get('images_used', [])[:3]):
                print(f"   {i+1}. {img}")
            
            if len(result.get('images_used', [])) > 3:
                print(f"   ... и еще {len(result.get('images_used', [])) - 3} изображений")
                
            print(f"🆔 ID генерации: {result.get('id', 'N/A')}")
            print(f"📅 Создано: {result.get('created_at', 'N/A')}")
            
        else:
            print(f"❌ Ошибка API: {response.status_code}")
            print(f"📄 Ответ: {response.text}")
            
    except requests.exceptions.Timeout:
        print("⏰ Таймаут запроса (генерация может занимать много времени)")
    except requests.exceptions.ConnectionError:
        print("🔌 Ошибка подключения - убедитесь что API сервер запущен на http://localhost:8000")
    except Exception as e:
        print(f"💥 Неожиданная ошибка: {e}")

def test_async_generation():
    """Тестируем асинхронную генерацию через tasks API"""
    
    print("\n" + "=" * 60)
    print("🧪 Тестируем асинхронную генерацию через /tasks API")
    print("=" * 60)
    
    # Данные для тестирования
    test_data = {
        "subject": "geography", 
        "topic": "Amazon Rainforest",
        "level": "beginner",
        "user_id": 1
    }
    
    print(f"📝 Создаем асинхронную задачу:")
    print(f"   Тема: {test_data['topic']}")
    print(f"   Предмет: {test_data['subject']}")
    print()
    
    try:
        # Создаем задачу
        response = requests.post(
            f"{API_BASE_URL}/api/v1/tasks/generate",
            json=test_data
        )
        
        if response.status_code == 200:
            task_info = response.json()
            task_id = task_info.get('task_id')
            
            print(f"✅ Задача создана: {task_id}")
            print("⏳ Отслеживаем прогресс...")
            
            # Отслеживаем прогресс
            for attempt in range(30):  # Максимум 5 минут
                time.sleep(10)  # Ждем 10 секунд
                
                status_response = requests.get(f"{API_BASE_URL}/api/v1/tasks/{task_id}")
                
                if status_response.status_code == 200:
                    status = status_response.json()
                    progress = status.get('progress', 0)
                    message = status.get('message', '')
                    task_status = status.get('status', '')
                    
                    print(f"📊 Прогресс: {progress}% - {message}")
                    
                    if task_status == 'completed':
                        result = status.get('result', {})
                        print("\n🎉 Генерация завершена!")
                        print(f"🎬 Видео: {result.get('video_url', 'N/A')}")
                        print(f"🎵 Аудио: {result.get('audio_url', 'N/A')}")
                        print(f"🖼️  Изображений: {len(result.get('images_used', []))}")
                        break
                    elif task_status == 'failed':
                        error = status.get('error', 'Unknown error')
                        print(f"❌ Генерация не удалась: {error}")
                        break
                else:
                    print(f"❌ Ошибка получения статуса: {status_response.status_code}")
                    break
            else:
                print("⏰ Превышено время ожидания")
                
        else:
            print(f"❌ Ошибка создания задачи: {response.status_code}")
            print(f"📄 Ответ: {response.text}")
            
    except Exception as e:
        print(f"💥 Ошибка: {e}")

def check_api_health():
    """Проверяем здоровье API"""
    print("🔍 Проверяем статус API...")
    
    try:
        response = requests.get(f"{API_BASE_URL}/", timeout=5)
        if response.status_code == 200:
            print("✅ API работает!")
            return True
        else:
            print(f"❌ API вернул код {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ API недоступен: {e}")
        return False

def main():
    """Main function to run the test."""
    print("🚀 Тестирование Wizetale API с AI генерацией изображений")
    
    # --- Configuration ---
    BASE_URL = "http://localhost:8000/api/v1"
    print("✅ Тест успешно завершен!")
    print("\n----------------------------------------")
    print("💡 Проверьте сгенерированные файлы в wizetale-api/generated_*/")
    print("----------------------------------------\n")

if __name__ == "__main__":
    print("🚀 Тестирование Wizetale API с AI генерацией изображений")
    print("=" * 60)
    
    # Проверяем API
    if not check_api_health():
        print("\n💡 Убедитесь что API запущен:")
        print("   cd wizetale-api")
        print("   source .venv/bin/activate")
        print("   uvicorn app.main:app --reload")
        exit(1)
    
    # Запускаем тесты
    test_ai_image_generation()
    test_async_generation()
    
    print("\n" + "=" * 60)
    print("🎯 Тестирование завершено!")
    print("💡 Проверьте сгенерированные файлы в wizetale-api/generated_*/") 