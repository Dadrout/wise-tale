# 🚀 WiseTale Production Setup Guide

## ⚠️ КРИТИЧЕСКИЕ ШАГИ ПЕРЕД ДЕПЛОЕМ

### 1. Настройка безопасности API

#### Обновите CORS в `wizetale-api/app/main.py`:
```python
if environment == "production":
    origins = [
        "https://your-domain.com",
        "https://www.your-domain.com", 
        "https://your-app.vercel.app",
    ]
```

#### Добавьте API аутентификацию:
```python
# В wizetale-api/app/api/dependencies.py
from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

async def verify_api_key(credentials: HTTPAuthorizationCredentials = Security(security)):
    api_key = credentials.credentials
    if api_key != settings.API_KEY:
        raise HTTPException(status_code=403, detail="Invalid API Key")
    return api_key

# Используйте в endpoints:
# @router.post("/generate", dependencies=[Depends(verify_api_key)])
```

### 2. Переменные окружения для Backend

Создайте `wizetale-api/.env`:
```env
# Обязательные переменные
ENVIRONMENT=production
API_KEY=сгенерируйте_безопасный_ключ
JWT_SECRET_KEY=сгенерируйте_другой_ключ

# AI сервисы (обязательно!)
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=ваш_ключ
AZURE_SPEECH_KEY=ваш_ключ
STABILITY_API_KEY=ваш_ключ
RUNWARE_API_KEY=ваш_ключ

# Firebase
GOOGLE_APPLICATION_CREDENTIALS_PATH=/путь/к/credentials.json
FIREBASE_STORAGE_BUCKET=ваш-bucket.appspot.com

# Redis (для Docker)
REDIS_URL=redis://redis:6379/0
```

### 3. Переменные окружения для Frontend (Vercel)

В настройках проекта Vercel добавьте:
```
NEXT_PUBLIC_API_URL=https://api.your-domain.com
NEXT_PUBLIC_FIREBASE_API_KEY=ваш_ключ
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ваш_домен
NEXT_PUBLIC_FIREBASE_PROJECT_ID=ваш_проект
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ваш_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=ваш_id
NEXT_PUBLIC_FIREBASE_APP_ID=ваш_app_id
```

## 🌐 Настройка доменов

### Рекомендуемая структура:
- `your-domain.com` → Frontend (Vercel)
- `api.your-domain.com` → Backend API (Digital Ocean)

### DNS настройки:
```
# Для основного домена (Vercel)
A    @     76.76.21.21 (Vercel IP)
CNAME www  cname.vercel-dns.com

# Для API субдомена (Digital Ocean)
A    api   ваш_digital_ocean_ip
```

## 🔒 SSL сертификат (Digital Ocean)

### Установка Certbot:
```bash
# На сервере Digital Ocean
sudo apt update
sudo apt install certbot python3-certbot-nginx
```

### Получение сертификата:
```bash
sudo certbot --nginx -d api.your-domain.com
```

### Обновление nginx.conf:
```nginx
server {
    listen 443 ssl http2;
    server_name api.your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/api.your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.your-domain.com/privkey.pem;
    
    # ... остальная конфигурация
}
```

## 📦 Деплой на Digital Ocean

### 1. Создайте Droplet:
- Ubuntu 22.04 LTS
- Минимум 2GB RAM
- Выберите регион ближе к вашим пользователям

### 2. Настройка сервера:
```bash
# Подключитесь к серверу
ssh root@your_server_ip

# Установите Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Установите Docker Compose
sudo apt install docker-compose

# Клонируйте репозиторий
git clone https://github.com/your-username/WiseTale.git
cd WiseTale

# Создайте .env файлы
nano wizetale-api/.env

# Запустите production
./deploy.sh
```

## ✅ Проверка после деплоя

### 1. Проверьте здоровье сервисов:
```bash
curl https://api.your-domain.com/health
```

### 2. Проверьте CORS:
Откройте консоль браузера на вашем сайте и выполните:
```javascript
fetch('https://api.your-domain.com/health')
  .then(r => r.json())
  .then(console.log)
```

### 3. Проверьте логи:
```bash
./manage-prod.sh logs
```

## 🚨 Важные замечания

1. **Никогда не коммитьте .env файлы!**
2. **Используйте сильные пароли для API ключей**
3. **Регулярно обновляйте SSL сертификаты**
4. **Настройте мониторинг (UptimeRobot, etc.)**
5. **Делайте регулярные бэкапы**

## 📱 Контакты для помощи

Если возникнут проблемы:
1. Проверьте логи: `./manage-prod.sh logs`
2. Проверьте статус: `docker-compose -f docker-compose.prod.yml ps`
3. Убедитесь, что все переменные окружения установлены 