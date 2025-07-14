#!/bin/bash

# WiseTale DigitalOcean Deployment Script 2.0 - The Clean Slate
# IP: 138.197.191.222

set -e # Exit on any error

# --- Configuration ---
SERVER_IP="138.197.191.222"
SERVER_USER="root"
PROJECT_DIR="/root/WiseTale"
REPO_URL="https://github.com/Dadrout/wise-tale.git"

# --- Colors ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# --- Main Script ---
echo "🌊 WiseTale DigitalOcean Deployment (Clean Slate Edition)"
echo "========================================================"
log_warning "ВНИМАНИЕ: Этот скрипт выполнит полную очистку Docker и проекта на сервере."
read -p "Вы уверены, что хотите продолжить? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_info "Развертывание отменено."
    exit 1
fi

log_info "Проверяю подключение к серверу..."
if ! ssh -o ConnectTimeout=5 -o BatchMode=yes $SERVER_USER@$SERVER_IP exit 2>/dev/null; then
    log_error "Не удается подключиться к серверу $SERVER_IP. Проверьте SSH-ключи и доступность сервера."
    exit 1
fi
log_success "Подключение к серверу успешно!"

log_info "Запускаю комплексную очистку и переустановку на $SERVER_IP..."

ssh $SERVER_USER@$SERVER_IP << 'EOF'
set -e # Stop on first error inside SSH session

# --- PHASE 1: FULL CLEANUP ---
echo "--- Фаза 1: Полная очистка ---"
echo "[1/4] Остановка всех Docker контейнеров..."
docker stop $(docker ps -a -q) 2>/dev/null || true

echo "[2/4] Полное удаление Docker и Docker Compose..."
apt-get purge -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin docker-compose
apt-get autoremove -y --purge
rm -rf /var/lib/docker /var/lib/containerd

echo "[3/4] Удаление директории проекта..."
rm -rf /root/WiseTale

echo "[4/4] Очистка завершена."


# --- PHASE 2: CORRECT INSTALLATION ---
echo "--- Фаза 2: Правильная установка ---"
echo "[1/3] Обновление пакетов..."
apt-get update

echo "[2/3] Установка последней версии Docker Engine..."
apt-get install -y ca-certificates curl
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin

echo "[3/3] Установка Docker Compose v2 (плагин)..."
LATEST_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
DOCKER_CONFIG=${DOCKER_CONFIG:-$HOME/.docker}
mkdir -p $DOCKER_CONFIG/cli-plugins
curl -SL https://github.com/docker/compose/releases/download/$LATEST_COMPOSE_VERSION/docker-compose-linux-x86_64 -o $DOCKER_CONFIG/cli-plugins/docker-compose
chmod +x $DOCKER_CONFIG/cli-plugins/docker-compose
docker compose version # Verify installation

echo "Установка завершена."


# --- PHASE 3: FINAL DEPLOYMENT ---
echo "--- Фаза 3: Финальное развертывание ---"
echo "[1/4] Клонирование репозитория..."
git clone https://github.com/Dadrout/wise-tale.git /root/WiseTale
cd /root/WiseTale

echo "[2/4] Создание конфигурационных файлов..."
# .env for backend
cat <<EOT > wizetale-api/.env
ENVIRONMENT=production
API_KEY=d2a7a8a3b3a3e6f5c8d8c9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0
AZURE_OPENAI_ENDPOINT=https://wisetale-openai.openai.azure.com/
AZURE_OPENAI_API_KEY=1NUY59QVZLFK9HnC5DK1AmcnuLj0bsnmnr9npBIZDHl2wjxKDdgnJQQ99BFACYeBjFXJ3w3AAABAC0GQTiS
AZURE_OPENAI_API_VERSION=2024-11-20
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o
AZURE_SPEECH_KEY=5066aUQHrPPAm6nCF8607si7WYCRCysA9X057JMQExK43xbZNuLJQQ99BFACYeBjFXJ3w3AAAYAC0GiPeH
AZURE_SPEECH_REGION=eastus
GOOGLE_APPLICATION_CREDENTIALS_PATH=/app/time-capsule-d5a66-c542dacf194a.json
FIREBASE_STORAGE_BUCKET=time-capsule-d5a66.appspot.com
RUNWARE_API_KEY=Tr78wTnmWMIoTFhMRoF9MQJBVIFHcYgY
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0
EOT

# Dockerfile
cat <<'EOT' > wizetale-api/Dockerfile
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Set workdir
WORKDIR /app

# Copy dependency files and install them
COPY ./wizetale-api/pyproject.toml ./
RUN pip install --no-cache-dir gunicorn uvicorn
RUN pip install --no-cache-dir -r pyproject.toml

# Copy the rest of the application
COPY ./wizetale-api/app ./app
COPY ./wizetale-api/worker.py ./
COPY ./wizetale-api/gunicorn.conf.py .

# Expose port and run
EXPOSE 8000
CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", "-c", "gunicorn.conf.py", "app.main:app"]
EOT

# gunicorn.conf.py
cat <<'EOT' > wizetale-api/gunicorn.conf.py
import os
bind = "0.0.0.0:8000"
cpu_count = os.cpu_count()
workers = cpu_count * 2 + 1 if cpu_count else 2
worker_class = "uvicorn.workers.UvicornWorker"
loglevel = "info"
accesslog = "-"
errorlog = "-"
proc_name = "wizetale-api"
EOT

# Empty .env for frontend to prevent warnings
touch wizetale-app/.env
echo "✅ Конфигурационные файлы созданы."

echo "[3/4] Сборка и запуск контейнеров..."
docker compose -f docker-compose.prod.yml up -d --build backend nginx redis frontend

echo "[4/4] Проверка статуса..."
sleep 15
docker compose -f docker-compose.prod.yml ps
EOF

log_success "Развертывание завершено!"
echo "Проверьте доступность API по адресу: http://$SERVER_IP/api/health"

exit 0
'EOF'
log_success "Развертывание завершено! Проверьте вывод выше."

exit 0 