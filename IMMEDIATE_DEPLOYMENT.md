# 🚀 WiseTale Immediate Deployment

## 📋 Статус: ГОТОВ К ДЕПЛОЮ!

**IP: 138.197.191.222**
**Domain: wizetale.com**

---

## 🎯 ПРЯМО СЕЙЧАС - ДЕПЛОЙ

### 1. **Digital Ocean Backend (138.197.191.222)**

```bash
# Подключитесь к серверу
ssh root@138.197.191.222

# Обновите систему
apt update && apt upgrade -y

# Установите Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Установите Docker Compose
apt install docker-compose -y

# Клонируйте репозиторий (замените your-username на ваш GitHub username)
git clone https://github.com/your-username/WiseTale.git
cd WiseTale

# Запустите деплой
./deploy.sh

# Проверьте статус
./manage-prod.sh status
```

### 2. **Vercel Frontend**

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
- **A record**: `api` → `138.197.191.222` (Digital Ocean)

### 4. **SSL Certificate**

```bash
# На вашем Digital Ocean сервере (после настройки DNS)
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

1. **Замените `your-username`** на ваш реальный GitHub username
2. **Настройте DNS** перед получением SSL сертификата
3. **Проверьте все endpoints** после деплоя

---

## 📞 Поддержка:

Если что-то пойдет не так:
- Проверьте логи: `./manage-prod.sh logs`
- Проверьте статус: `./manage-prod.sh status`
- Перезапустите: `./manage-prod.sh restart`

**Удачи с деплоем! 🚀** 