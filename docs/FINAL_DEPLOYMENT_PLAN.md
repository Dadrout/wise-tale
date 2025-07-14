# 🚀 WiseTale Final Deployment Plan

## 📋 Статус: ГОТОВ К ДЕПЛОЮ!

### ✅ Что готово:
- [x] API_KEY добавлен в .env
- [x] CORS настроен для wizetale.com
- [x] Безопасность API настроена
- [x] Docker конфигурация готова
- [x] Nginx настроен
- [x] Vercel CLI установлен
- [x] Все файлы закоммичены

---

## 🎯 ПОШАГОВЫЙ ДЕПЛОЙ

### 1. **Digital Ocean Backend Deploy**

**Замените `YOUR_DROPLET_IP` на реальный IP вашего сервера**

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

# Клонируйте репозиторий
git clone https://github.com/your-username/WiseTale.git
cd WiseTale

# Запустите деплой
./deploy.sh

# Проверьте статус
./manage-prod.sh status
```

### 2. **Vercel Frontend Deploy**

```bash
# В папке wizetale-app
cd wizetale-app

# Логин в Vercel (если нужно)
vercel login

# Деплой
vercel --prod
```

### 3. **DNS Configuration**

Настройте DNS записи для wizetale.com:

- **A record**: `@` → `76.76.21.21` (Vercel)
- **CNAME**: `www` → `cname.vercel-dns.com` (Vercel)  
- **A record**: `api` → `YOUR_DROPLET_IP` (Digital Ocean)

### 4. **SSL Certificate**

```bash
# На вашем Digital Ocean сервере
apt install certbot python3-certbot-nginx -y
certbot --nginx -d api.wizetale.com
```

---

## 🔧 Проверка после деплоя

### Backend Health Check:
```bash
curl https://api.wizetale.com/health
```

### Frontend Health Check:
```bash
curl https://wizetale.com
```

### Monitor Logs:
```bash
# На сервере
./manage-prod.sh logs
```

---

## 🎯 Финальные URL:

- **Frontend**: https://wizetale.com
- **Backend API**: https://api.wizetale.com
- **Health Check**: https://api.wizetale.com/health

---

## 🚨 Важные заметки:

1. **Замените `YOUR_DROPLET_IP`** на реальный IP вашего Digital Ocean сервера
2. **Обновите GitHub URL** в командах клонирования
3. **Настройте DNS** перед получением SSL сертификата
4. **Проверьте все endpoints** после деплоя

---

## 📞 Поддержка:

Если что-то пойдет не так:
- Проверьте логи: `./manage-prod.sh logs`
- Проверьте статус: `./manage-prod.sh status`
- Перезапустите: `./manage-prod.sh restart`

**Удачи с деплоем! 🚀** 