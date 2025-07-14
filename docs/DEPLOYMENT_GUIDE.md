# 🚀 WiseTale Production Deployment Guide for wizetale.com

## 📋 Быстрый старт

### 1. Подготовка Digital Ocean Droplet

```bash
# Создайте новый droplet:
# - Ubuntu 22.04 LTS
# - 4GB RAM (рекомендуется)
# - 2 CPU cores
# - 80GB SSD
# - Выберите регион ближе к вашим пользователям
```

### 2. Настройка сервера

```bash
# Подключитесь к серверу
ssh root@YOUR_DROPLET_IP

# Обновите систему
apt update && apt upgrade -y

# Установите Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Установите Docker Compose
apt install docker-compose -y

# Добавьте пользователя в группу docker
usermod -aG docker $USER
```

### 3. Клонирование и настройка

```bash
# Клонируйте репозиторий
git clone https://github.com/your-username/WiseTale.git
cd WiseTale

# Скопируйте .env файлы (если нужно)
# Убедитесь что API_KEY уже добавлен в wizetale-api/.env

# Сделайте скрипты исполняемыми
chmod +x deploy.sh manage-prod.sh
```

### 4. Настройка домена

#### DNS записи (в панели управления доменом):
```
# Для основного домена (Vercel)
A    @     76.76.21.21
CNAME www  cname.vercel-dns.com

# Для API (Digital Ocean)
A    api   YOUR_DROPLET_IP
```

### 5. Деплой бэкенда

```bash
# Запустите production деплой
./deploy.sh

# Проверьте статус
./manage-prod.sh status

# Проверьте логи
./manage-prod.sh logs
```

### 6. SSL сертификат

```bash
# Установите Certbot
apt install certbot python3-certbot-nginx

# Получите SSL сертификат
certbot --nginx -d api.wizetale.com

# Проверьте автообновление
certbot renew --dry-run
```

### 7. Деплой фронтенда на Vercel

1. **Подключите GitHub репозиторий к Vercel**
2. **Настройте проект:**
   - Root Directory: `wizetale-app`
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **Добавьте Environment Variables в Vercel:**
```
NEXT_PUBLIC_API_URL=https://api.wizetale.com
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. **Деплой:**
   - Нажмите "Deploy" в Vercel
   - Дождитесь завершения сборки

### 8. Настройка кастомного домена в Vercel

1. В настройках проекта Vercel добавьте домен:
   - `wizetale.com`
   - `www.wizetale.com`

2. Обновите DNS записи согласно инструкциям Vercel

## 🔧 Проверка после деплоя

### 1. Проверьте API
```bash
curl https://api.wizetale.com/health
```

### 2. Проверьте фронтенд
```bash
curl https://wizetale.com
```

### 3. Проверьте CORS
Откройте консоль браузера на wizetale.com и выполните:
```javascript
fetch('https://api.wizetale.com/health')
  .then(r => r.json())
  .then(console.log)
```

## 📊 Мониторинг

### Настройте мониторинг:
1. **UptimeRobot** - для проверки доступности
2. **New Relic** - для производительности
3. **Logs** - регулярно проверяйте логи

### Команды для мониторинга:
```bash
# Статус сервисов
./manage-prod.sh status

# Логи в реальном времени
./manage-prod.sh logs -f

# Использование ресурсов
./manage-prod.sh monitor
```

## 🚨 Важные замечания

1. **Безопасность:**
   - Никогда не коммитьте .env файлы
   - Регулярно обновляйте SSL сертификаты
   - Мониторьте логи на подозрительную активность

2. **Производительность:**
   - Настройте CDN для статических файлов
   - Оптимизируйте изображения
   - Используйте кэширование

3. **Бэкапы:**
   - Настройте автоматические бэкапы базы данных
   - Бэкапите медиа файлы
   - Тестируйте восстановление

## 🆘 Troubleshooting

### Если API не отвечает:
```bash
# Проверьте статус контейнеров
docker-compose -f docker-compose.prod.yml ps

# Проверьте логи
./manage-prod.sh logs backend

# Перезапустите сервисы
./manage-prod.sh restart
```

### Если SSL не работает:
```bash
# Проверьте сертификат
certbot certificates

# Обновите сертификат
certbot renew

# Проверьте nginx конфигурацию
nginx -t
```

### Если фронтенд не подключается к API:
1. Проверьте CORS настройки
2. Убедитесь что NEXT_PUBLIC_API_URL правильный
3. Проверьте SSL сертификат

## 🎉 Готово!

После выполнения всех шагов ваш сайт будет доступен по адресу:
- **Frontend**: https://wizetale.com
- **API**: https://api.wizetale.com

Удачи с запуском! 🚀 