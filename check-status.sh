#!/bin/bash

echo "📊 Проверка статуса сервисов..."

echo "🐳 Docker контейнеры:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "📝 Логи бекенда:"
docker-compose -f docker-compose.prod.yml logs backend --tail=10

echo ""
echo "📝 Логи nginx:"
docker-compose -f docker-compose.prod.yml logs nginx --tail=10

echo ""
echo "📝 Логи redis:"
docker-compose -f docker-compose.prod.yml logs redis --tail=5

echo ""
echo "🔍 Проверка здоровья сервисов:"
echo "Backend health check:"
curl -f http://localhost:8000/health 2>/dev/null && echo "✅ Backend здоров" || echo "❌ Backend недоступен"

echo ""
echo "Nginx health check:"
curl -f http://localhost:80/health 2>/dev/null && echo "✅ Nginx здоров" || echo "❌ Nginx недоступен" 