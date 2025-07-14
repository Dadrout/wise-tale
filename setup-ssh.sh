#!/bin/bash

# Настройка SSH для DigitalOcean сервера
# IP: 138.197.191.222

SERVER_IP="138.197.191.222"
SERVER_USER="root"
SSH_KEY="~/.ssh/wisetale_key"

echo "🔑 Настройка SSH подключения к DigitalOcean"
echo "=========================================="
echo "Server: $SERVER_IP"
echo ""

# Проверяем наличие ключа
if [ ! -f "$SSH_KEY" ]; then
    echo "❌ SSH ключ не найден: $SSH_KEY"
    echo "Создайте ключ командой:"
    echo "ssh-keygen -t rsa -b 4096 -f ~/.ssh/wisetale_key"
    exit 1
fi

echo "✅ SSH ключ найден"

# Показываем публичный ключ
echo ""
echo "📋 Ваш публичный ключ:"
echo "================================"
cat ~/.ssh/wisetale_key.pub
echo "================================"
echo ""

echo "📝 Инструкции для добавления ключа на сервер:"
echo ""
echo "1. Подключитесь к серверу:"
echo "   ssh root@$SERVER_IP"
echo ""
echo "2. Добавьте ключ в authorized_keys:"
echo "   mkdir -p ~/.ssh"
echo "   echo '$(cat ~/.ssh/wisetale_key.pub)' >> ~/.ssh/authorized_keys"
echo "   chmod 600 ~/.ssh/authorized_keys"
echo "   chmod 700 ~/.ssh"
echo ""
echo "3. Или скопируйте ключ командой:"
echo "   ssh-copy-id -i ~/.ssh/wisetale_key.pub root@$SERVER_IP"
echo ""

echo "🔧 Альтернативно, можете выполнить эти команды:"
echo ""
echo "ssh-copy-id -i ~/.ssh/wisetale_key.pub root@$SERVER_IP"
echo ""

echo "После настройки SSH, запустите:"
echo "  ./deploy-backend-only.sh" 