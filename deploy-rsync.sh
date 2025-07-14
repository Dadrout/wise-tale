#!/bin/bash
set -e

# --- Конфигурация ---
REMOTE_USER="root"
REMOTE_HOST="138.197.191.222"
PROJECT_DIR="/root/WiseTale"
LOCAL_PROJECT_DIR="." 

echo "--- Фаза 1: Синхронизация файлов с сервером ---"
# Сначала синхронизируем все, кроме .env
rsync -avz --delete \
  --exclude '.git' \
  --exclude '.idea' \
  --exclude 'node_modules' \
  --exclude 'wizetale-api/venv' \
  --exclude 'wizetale-api/.env' \
  "$LOCAL_PROJECT_DIR/" "$REMOTE_USER@$REMOTE_HOST:$PROJECT_DIR/"

echo "✅ Файлы успешно синхронизированы."

echo "--- Фаза 2: Развертывание на сервере ---"
ssh $REMOTE_USER@$REMOTE_HOST << EOF
    set -e
    
    # --- Переходим в директорию проекта ---
    # Создаем, если не существует, и переходим в нее
    mkdir -p "${PROJECT_DIR}"
    cd "${PROJECT_DIR}"

    # --- Установка Docker, если он не установлен ---
    if ! [ -x "\$(command -v docker)" ]; then
        echo "--- Docker не найден, начинаю установку... ---"
        apt-get update
        apt-get install -y ca-certificates curl
        install -m 0755 -d /etc/apt/keyrings
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
        chmod a+r /etc/apt/keyrings/docker.asc
        echo "deb [arch=\$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \$(. /etc/os-release && echo "\$VERSION_CODENAME") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
        apt-get update
        apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
        echo "✅ Docker успешно установлен."
    fi

    echo "--- Остановка старых контейнеров ---"
    docker compose -f docker-compose.prod.yml down -v --remove-orphans || true

    echo "--- Сборка и запуск новых контейнеров ---"
    DOCKER_BUILDKIT=0 docker compose -f docker-compose.prod.yml up -d --build backend

    echo "🚀 Развертывание успешно завершено!"
EOF 