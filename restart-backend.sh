#!/bin/bash

echo "🔄 Полный перезапуск бекенда..."

# Остановить все контейнеры
echo "📦 Останавливаю все контейнеры..."
docker-compose -f docker-compose.prod.yml down

# Удалить все контейнеры и образы
echo "🧹 Очищаю контейнеры и образы..."
docker system prune -f
docker volume prune -f

# Удалить конкретные образы если они есть
docker rmi wizetale-backend:latest 2>/dev/null || true
docker rmi wizetale-backend-prod 2>/dev/null || true

# Пересобрать и запустить
echo "🚀 Пересобираю и запускаю бекенд..."
docker-compose -f docker-compose.prod.yml up -d --build

echo "✅ Бекенд перезапущен!"
echo "📊 Статус контейнеров:"
docker-compose -f docker-compose.prod.yml ps 