#!/bin/bash

# Полная настройка сервера для WiseTale
# IP: 138.197.191.222

SERVER_IP="138.197.191.222"
SERVER_USER="root"

echo "🛠️ Полная настройка сервера для WiseTale"
echo "=========================================="
echo "Server: $SERVER_IP"
echo ""

# Проверяем подключение
echo "📡 Проверяю подключение к серверу..."
if ! ssh -i ~/.ssh/id_rsa_digitalocean -o ConnectTimeout=5 -o BatchMode=yes $SERVER_USER@$SERVER_IP exit 2>/dev/null; then
    echo "❌ Не удается подключиться к серверу"
    exit 1
fi

echo "✅ Подключение успешно!"

# Настраиваем сервер
echo "🔧 Настраиваю сервер..."
ssh -i ~/.ssh/id_rsa_digitalocean $SERVER_USER@$SERVER_IP << 'EOF'
echo "📦 Обновляю систему..."
apt update && apt upgrade -y

echo "🐳 Устанавливаю Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    usermod -aG docker $USER
else
    echo "Docker уже установлен"
fi

echo "📦 Устанавливаю Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    apt install docker-compose -y
else
    echo "Docker Compose уже установлен"
fi

echo "📁 Клонирую репозиторий..."
if [ -d "WiseTale" ]; then
    echo "Обновляю существующий репозиторий..."
    cd WiseTale
    git pull origin main
else
    echo "Клонирую новый репозиторий..."
    git clone https://github.com/Dadrout/wise-tale.git
    cd WiseTale
fi

echo "✅ Настройка сервера завершена!"
EOF

echo "✅ Сервер настроен!"
echo ""
echo "🚀 Теперь можете запустить деплой:"
echo "  ./deploy-backend-only.sh" 