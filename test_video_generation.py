#!/usr/bin/env python3
"""
Простой тест для проверки создания видео с AI изображениями
"""
import requests
import time
import json

def test_video_generation():
    """Тест создания видео с AI изображениями"""
    
    print("🎬 Тестирование создания видео с AI изображениями")
    print("=" * 50)
    
    # Проверяем статус API
    try:
        response = requests.get("http://localhost:8000/")
        if response.status_code == 200:
            print("✅ API работает!")
        else:
            print("❌ API не работает")
            return
    except Exception as e:
        print(f"❌ Ошибка подключения к API: {e}")
        return
    
    # Создаем задачу генерации
    print("\n📝 Создаем задачу генерации видео...")
    task_data = {
        "subject": "history",
        "topic": "Renaissance Italy",
        "user_id": 123,
        "persona": "narrator",
        "language": "en"
    }
    
    try:
        response = requests.post(
            "http://localhost:8000/api/v1/tasks/generate",
            json=task_data,
            timeout=10
        )
        
        if response.status_code == 200:
            task_info = response.json()
            task_id = task_info["task_id"]
            print(f"✅ Задача создана: {task_id}")
            
            # Отслеживаем прогресс
            print("\n⏳ Отслеживаем прогресс...")
            
            for i in range(30):  # Максимум 5 минут
                try:
                    status_response = requests.get(f"http://localhost:8000/api/v1/tasks/{task_id}")
                    if status_response.status_code == 200:
                        status_data = status_response.json()
                        
                        progress = status_data.get("progress", 0)
                        status = status_data.get("status", "unknown")
                        message = status_data.get("message", "")
                        
                        print(f"📊 Прогресс: {progress}% - {message}")
                        
                        if status == "completed":
                            print("\n🎉 Генерация завершена!")
                            
                            # Показываем результаты
                            result = status_data.get("result", {})
                            print(f"🎬 Видео: {result.get('video_url', 'N/A')}")
                            print(f"🎵 Аудио: {result.get('audio_url', 'N/A')}")
                            print(f"🖼️  Изображений: {len(result.get('images_used', []))}")
                            
                            # Показываем список изображений
                            images = result.get('images_used', [])
                            if images:
                                print("\n🖼️  Использованные изображения:")
                                for idx, img in enumerate(images, 1):
                                    print(f"   {idx}. {img}")
                            
                            return True
                            
                        elif status == "failed":
                            print(f"❌ Задача провалилась: {message}")
                            return False
                            
                        elif status == "running" or status == "in_progress":
                            # Продолжаем ждать
                            time.sleep(10)
                        else:
                            print(f"⚠️  Неизвестный статус: {status}")
                            time.sleep(10)
                    else:
                        print(f"❌ Ошибка получения статуса: {status_response.status_code}")
                        time.sleep(10)
                        
                except Exception as e:
                    print(f"❌ Ошибка отслеживания: {e}")
                    time.sleep(10)
            
            print("⏰ Таймаут - задача не завершилась за 5 минут")
            return False
            
        else:
            print(f"❌ Ошибка создания задачи: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        return False

if __name__ == "__main__":
    success = test_video_generation()
    
    print("\n" + "=" * 50)
    if success:
        print("🎯 Тест успешно завершен!")
        print("💡 Проверьте сгенерированные файлы в wizetale-api/generated_*/")
    else:
        print("❌ Тест не пройден")
        print("💡 Проверьте логи сервера для диагностики") 