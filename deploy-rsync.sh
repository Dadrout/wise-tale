#!/bin/bash
set -e

# --- Конфигурация ---
REMOTE_USER="root"
REMOTE_HOST="138.197.191.222"
PROJECT_DIR="/root/WiseTale"
LOCAL_PROJECT_DIR="." 

echo "--- Фаза 1: Синхронизация файлов с сервером ---"
rsync -avz --delete \
  --exclude '.git' \
  --exclude '.idea' \
  --exclude 'node_modules' \
  --exclude 'wizetale-api/venv' \
  "$LOCAL_PROJECT_DIR/" "$REMOTE_USER@$REMOTE_HOST:$PROJECT_DIR/"

echo "✅ Файлы успешно синхронизированы."

echo "--- Фаза 2: Развертывание на сервере ---"
ssh $REMOTE_USER@$REMOTE_HOST 'bash -s' <<'EOF'
    set -e
    
    # --- Переходим в директорию проекта ---
    cd /root/WiseTale

    # --- Остановка старых контейнеров ---
    docker compose -f docker-compose.prod.yml down -v --remove-orphans || true

    # --- Сборка и запуск новых контейнеров ---
    DOCKER_BUILDKIT=0 docker compose -f docker-compose.prod.yml up -d --build

    echo "🚀 Развертывание успешно завершено!"
EOF 