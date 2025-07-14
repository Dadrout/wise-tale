# ✅ WiseTale Production Deployment Checklist

## 🎯 Статус готовности: **ГОТОВ К ДЕПЛОЮ!**

### ✅ Что уже сделано:
- [x] API_KEY добавлен в .env
- [x] CORS настроен для wizetale.com
- [x] Docker конфигурация готова
- [x] Nginx настроен
- [x] Безопасность API настроена
- [x] Vercel конфигурация готова

---

## 🚀 ПОШАГОВЫЙ ДЕПЛОЙ

### 1. Digital Ocean Droplet
- [ ] Создать droplet Ubuntu 22.04 (4GB RAM, 2 CPU)
- [ ] Подключиться по SSH
- [ ] Установить Docker и Docker Compose
- [ ] Клонировать репозиторий

### 2. DNS Настройка
- [ ] A запись: `@` → `76.76.21.21` (Vercel)
- [ ] CNAME: `www` → `cname.vercel-dns.com` (Vercel)
- [ ] A запись: `api` → `YOUR_DROPLET_IP` (Digital Ocean)

### 3. Backend Deploy
- [ ] Запустить `./deploy.sh`
- [ ] Проверить `./manage-prod.sh status`
- [ ] Проверить логи `./manage-prod.sh logs`

### 4. SSL Certificate
- [ ] Установить Certbot: `apt install certbot python3-certbot-nginx`
- [ ] Получить сертификат: `certbot --nginx -d api.wizetale.com`
- [ ] Проверить автообновление: `certbot renew --dry-run`

### 5. Vercel Deploy
- [ ] Подключить GitHub репозиторий
- [ ] Настроить Root Directory: `wizetale-app`
- [ ] Добавить Environment Variables:
  ```
  NEXT_PUBLIC_API_URL=https://api.wizetale.com
  NEXT_PUBLIC_FIREBASE_API_KEY=your_key
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
  NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender
  NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
  ```
- [ ] Deploy проект

### 6. Custom Domain в Vercel
- [ ] Добавить домен: `wizetale.com`
- [ ] Добавить домен: `www.wizetale.com`
- [ ] Обновить DNS записи согласно Vercel

---

## 🔍 ТЕСТИРОВАНИЕ

### Backend Tests
- [ ] `curl https://api.wizetale.com/health`
- [ ] `curl https://api.wizetale.com/docs`
- [ ] Проверить SSL сертификат

### Frontend Tests
- [ ] Открыть https://wizetale.com
- [ ] Проверить загрузку страницы
- [ ] Проверить консоль на ошибки

### Integration Tests
- [ ] Тест CORS в консоли браузера:
  ```javascript
  fetch('https://api.wizetale.com/health')
    .then(r => r.json())
    .then(console.log)
  ```
- [ ] Тест генерации видео
- [ ] Тест аутентификации

---

## 📊 МОНИТОРИНГ

### Настройка мониторинга
- [ ] UptimeRobot для проверки доступности
- [ ] Настроить алерты на email
- [ ] Регулярно проверять логи

### Команды мониторинга
```bash
# Статус сервисов
./manage-prod.sh status

# Логи в реальном времени
./manage-prod.sh logs -f

# Использование ресурсов
./manage-prod.sh monitor

# Проверка SSL
certbot certificates
```

---

## 🚨 ВАЖНЫЕ ЗАМЕЧАНИЯ

### Безопасность
- [x] API_KEY настроен
- [x] CORS ограничен
- [x] SSL сертификат (после деплоя)
- [ ] Регулярные обновления
- [ ] Мониторинг логов

### Производительность
- [ ] CDN для статических файлов
- [ ] Оптимизация изображений
- [ ] Кэширование API ответов

### Бэкапы
- [ ] Автоматические бэкапы БД
- [ ] Бэкапы медиа файлов
- [ ] Тестирование восстановления

---

## 🎉 ГОТОВО!

После выполнения всех пунктов:
- **Frontend**: https://wizetale.com ✅
- **API**: https://api.wizetale.com ✅
- **SSL**: Настроен ✅
- **Мониторинг**: Настроен ✅

**Удачи с запуском! 🚀** 