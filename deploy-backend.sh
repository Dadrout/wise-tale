#!/bin/bash

set -e  # Exit on any error

echo "🚀 Начинаю деплой бекенда..."

# Проверяем наличие необходимых файлов
echo "📋 Проверяю файлы..."
if [ ! -f "docker-compose.prod.yml" ]; then
    echo "❌ Ошибка: docker-compose.prod.yml не найден"
    exit 1
fi

if [ ! -f "wizetale-api/Dockerfile" ]; then
    echo "❌ Ошибка: Dockerfile не найден"
    exit 1
fi

if [ ! -f "nginx.conf" ]; then
    echo "❌ Ошибка: nginx.conf не найден"
    exit 1
fi

# Останавливаем все контейнеры
echo "🛑 Останавливаю существующие контейнеры..."
docker-compose -f docker-compose.prod.yml down --remove-orphans || true

# Очищаем Docker кэш
echo "🧹 Очищаю Docker кэш..."
docker system prune -f
docker volume prune -f

# Удаляем старые образы
echo "🗑️ Удаляю старые образы..."
docker rmi wizetale-backend:latest 2>/dev/null || true
docker rmi wizetale-backend-prod 2>/dev/null || true

# Проверяем синтаксис docker-compose
echo "✅ Проверяю синтаксис docker-compose..."
docker-compose -f docker-compose.prod.yml config

# Собираем и запускаем
echo "🔨 Собираю и запускаю контейнеры..."
docker-compose -f docker-compose.prod.yml up -d --build

# Ждем немного для запуска
echo "⏳ Жду запуска контейнеров..."
sleep 10

# Проверяем статус
echo "📊 Статус контейнеров:"
docker-compose -f docker-compose.prod.yml ps

# Проверяем логи
echo "📝 Логи бекенда:"
docker-compose -f docker-compose.prod.yml logs backend --tail=20

echo "✅ Деплой завершен!"
echo "🌐 Проверьте доступность по адресу: http://your-server-ip" 