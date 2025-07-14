#!/bin/bash

# Быстрый деплой только бекенда на DigitalOcean
# IP: 138.197.191.222

SERVER_IP="138.197.191.222"
SERVER_USER="root"

echo "🚀 Быстрый деплой бекенда на DigitalOcean"
echo "=========================================="
echo "Server: $SERVER_IP"
echo ""

# Проверяем подключение
echo "📡 Проверяю подключение к серверу..."
if ! ssh -i ~/.ssh/wisetale_key -o ConnectTimeout=5 -o BatchMode=yes $SERVER_USER@$SERVER_IP exit 2>/dev/null; then
    echo "❌ Не удается подключиться к серверу"
    echo "Убедитесь что SSH ключи настроены"
    exit 1
fi

echo "✅ Подключение успешно!"

# Выполняем деплой
echo "🔨 Деплою бекенд..."
ssh -i ~/.ssh/wisetale_key $SERVER_USER@$SERVER_IP << 'EOF'
cd wise-tale

echo "🛑 Останавливаю контейнеры..."
docker-compose -f docker-compose.prod.yml down

echo "🧹 Очищаю кэш..."
docker system prune -f

echo "🗑️ Удаляю старые образы..."
docker rmi wizetale-backend:latest 2>/dev/null || true

echo "🔨 Собираю и запускаю..."
docker-compose -f docker-compose.prod.yml up -d --build

echo "⏳ Жду запуска..."
sleep 10

echo "📊 Статус:"
docker-compose -f docker-compose.prod.yml ps

echo "📝 Логи:"
docker-compose -f docker-compose.prod.yml logs backend --tail=5
EOF

echo "✅ Деплой завершен!"
echo ""
echo "🌐 API доступен по адресу:"
echo "  http://$SERVER_IP:8000"
echo ""
echo "📊 Для проверки статуса:"
echo "  ssh $SERVER_USER@$SERVER_IP"
echo "  cd WiseTale"
echo "  ./check-status.sh" 