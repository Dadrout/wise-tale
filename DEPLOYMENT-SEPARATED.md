# 🚀 WiseTale Separated Deployment Guide

Deploy frontend on **Vercel** and backend on **Digital Ocean** for optimal performance and cost.

## 📋 Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vercel CDN    │    │ Digital Ocean   │    │     Users       │
│                 │    │                 │    │                 │
│ 🌐 Landing Page │    │ 🔧 FastAPI      │────│ 👥 Students     │
│ 🎯 Main App     │────│ 💾 Redis        │    │ 👨‍🏫 Teachers     │
│                 │    │ 🔒 Nginx        │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🎯 Benefits of Separated Deployment

- **🚀 Performance**: Vercel CDN for fast frontend delivery
- **💰 Cost**: Only pay for backend compute on DO
- **🔄 Scalability**: Independent scaling of frontend/backend
- **🌍 Global**: Vercel edge network worldwide
- **🛠 Simplicity**: Easy frontend updates via git push

## 📦 Part 1: Backend Deployment (Digital Ocean)

### **Prerequisites**
- Digital Ocean Droplet (2GB+ RAM recommended)
- Docker & Docker Compose installed
- Domain name (optional)

### **1. Setup Digital Ocean Droplet**

```bash
# SSH into your droplet
ssh root@your-droplet-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### **2. Deploy Backend**

```bash
# Clone your repository
git clone https://github.com/your-username/wisetale.git
cd wisetale

# Make scripts executable
chmod +x deploy-backend.sh manage-backend.sh

# Configure environment
cp wisetale-api/.env.example wisetale-api/.env
nano wisetale-api/.env  # Edit with your credentials

# Deploy backend
./deploy-backend.sh
```

### **3. Backend Environment Variables**

Edit `wisetale-api/.env`:

```bash
# Environment
ENVIRONMENT=production

# API Settings
API_PORT=8000
API_HOST=0.0.0.0

# Redis Configuration
REDIS_URL=redis://redis:6379

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
SUPABASE_JWT_SECRET=your_supabase_jwt_secret

# Security
JWT_SECRET=your_secure_jwt_secret_here

# Azure OpenAI (Required for video generation)
AZURE_OPENAI_API_KEY=your_azure_openai_key
AZURE_OPENAI_ENDPOINT=https://your-endpoint.openai.azure.com/
AZURE_OPENAI_API_VERSION=2023-05-15
AZURE_OPENAI_DEPLOYMENT_NAME=your_deployment_name

# Azure Speech (Required for voiceover)
AZURE_SPEECH_KEY=your_azure_speech_key
AZURE_SPEECH_REGION=eastus

# External APIs (Optional)
PEXELS_API_KEY=your_pexels_api_key
PIXABAY_API_KEY=your_pixabay_api_key
```

### **4. Backend Management**

```bash
# Check status
./manage-backend.sh status

# View logs
./manage-backend.sh logs

# Health check
./manage-backend.sh health

# Backup data
./manage-backend.sh backup

# All commands
./manage-backend.sh help
```

## 🌐 Part 2: Frontend Deployment (Vercel)

### **Prerequisites**
- Vercel account
- GitHub repository
- Domain name (optional)

### **1. Deploy Landing Page to Vercel**

1. **Connect GitHub to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Connect your GitHub account
   - Import your repository

2. **Configure Landing Page:**
   ```bash
   # Project Settings in Vercel:
   Framework Preset: Next.js
   Root Directory: wisetale-landing
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

3. **Environment Variables:**
   ```bash
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://your-api-domain.com
   
   # Firebase (for analytics)
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Deploy:**
   ```bash
   # Vercel will auto-deploy on git push
   git add .
   git commit -m "Deploy landing page"
   git push origin main
   ```

### **2. Deploy Main App to Vercel**

1. **Create Second Vercel Project:**
   - Import same repository
   - Create new project for main app

2. **Configure Main App:**
   ```bash
   # Project Settings in Vercel:
   Framework Preset: Next.js
   Root Directory: wisetale-app
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

3. **Environment Variables:**
   ```bash
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://your-api-domain.com
   
   # Firebase (same as landing)
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   # ... other Firebase config
   ```

## 🔗 Part 3: Connect Frontend & Backend

### **1. Update CORS in Backend**

Edit `wisetale-api/app/main.py`:

```python
# Update CORS origins for production
if environment == "production":
    origins = [
        "https://your-landing-domain.vercel.app",
        "https://your-app-domain.vercel.app",
        "https://your-custom-domain.com",  # if using custom domain
    ]
```

### **2. Update Frontend API URLs**

The frontend apps automatically use `NEXT_PUBLIC_API_URL` environment variable.

### **3. Custom Domains (Optional)**

1. **Backend Domain (Digital Ocean):**
   ```bash
   # Point your domain to DO droplet IP
   # Update DNS A record: api.yourdomain.com -> droplet-ip
   
   # Update nginx config for SSL
   # Use Let's Encrypt for free SSL
   ```

2. **Frontend Domains (Vercel):**
   ```bash
   # In Vercel dashboard:
   # Project Settings -> Domains -> Add Domain
   # landing.yourdomain.com -> Landing Page
   # app.yourdomain.com -> Main App
   ```

## 🧪 Part 4: Testing Deployment

### **1. Test Backend**

```bash
# Health check
curl https://your-api-domain.com/health

# API docs
curl https://your-api-domain.com/docs

# Test endpoint
curl -X POST https://your-api-domain.com/api/v1/generate/ \
  -H "Content-Type: application/json" \
  -d '{"subject":"history","topic":"Roman Empire","user_id":1}'
```

### **2. Test Frontend**

1. **Landing Page:** Visit your Vercel landing URL
2. **Click "Start Learning"** - should redirect to main app
3. **Test video generation** in main app
4. **Check browser console** for any CORS errors

### **3. Test Integration**

1. **Landing → Main App navigation**
2. **API calls from frontend**
3. **Waitlist form submission**
4. **Video generation flow**

## 📊 Part 5: Monitoring & Maintenance

### **Backend Monitoring (Digital Ocean)**

```bash
# Real-time monitoring
./manage-backend.sh monitor

# Check logs
./manage-backend.sh logs

# Health status
./manage-backend.sh health

# Resource usage
docker stats
```

### **Frontend Monitoring (Vercel)**

- **Vercel Dashboard:** Analytics, performance, errors
- **Firebase Analytics:** User behavior, page views
- **Browser DevTools:** Console errors, network requests

### **Automated Backups**

```bash
# Setup daily backup cron job on DO
crontab -e

# Add line for daily backup at 2 AM
0 2 * * * /path/to/wisetale/manage-backend.sh backup
```

## 🛠 Part 6: Updates & CI/CD

### **Frontend Updates**
```bash
# Automatic deployment on git push
git add .
git commit -m "Update frontend"
git push origin main
# Vercel auto-deploys in ~2 minutes
```

### **Backend Updates**
```bash
# SSH to Digital Ocean droplet
ssh root@your-droplet-ip
cd wisetale

# Pull latest changes
git pull origin main

# Rebuild and deploy
./deploy-backend.sh
```

### **Environment Updates**
```bash
# Backend: Edit .env file and restart
nano wisetale-api/.env
./manage-backend.sh restart

# Frontend: Update in Vercel dashboard
# Project Settings -> Environment Variables
```

## 🚨 Troubleshooting

### **CORS Errors**
- Check backend CORS configuration
- Verify frontend domain in allowed origins
- Check network tab for proper API URLs

### **API Connection Failed**
- Verify backend is running: `./manage-backend.sh health`
- Check firewall: port 8000 should be open
- Verify environment variables

### **Build Failures**
- Check Vercel build logs
- Verify all dependencies in package.json
- Check environment variables

### **Performance Issues**
- Monitor backend resources: `./manage-backend.sh monitor`
- Check Vercel analytics for frontend performance
- Optimize images and video sizes

## 💡 Cost Optimization

### **Vercel (Frontend)**
- **Free tier:** 100GB bandwidth, unlimited requests
- **Pro tier:** $20/month for team features

### **Digital Ocean (Backend)**
- **Basic Droplet:** $12/month (2GB RAM, 50GB SSD)
- **Managed Database:** $15/month (Redis alternative)

### **Total Monthly Cost**
- **Hobby Project:** ~$12/month (DO droplet + Vercel free)
- **Production:** ~$32/month (DO droplet + Vercel Pro)

## 🎉 Success!

Your WiseTale platform is now deployed with:
- ⚡ **Fast frontend** on Vercel CDN
- 🚀 **Scalable backend** on Digital Ocean
- 🔒 **Secure API** with proper CORS
- 📊 **Monitoring** and health checks
- 🔄 **Easy updates** via git

**Next Steps:**
1. Set up custom domains
2. Configure SSL certificates
3. Set up monitoring alerts
4. Plan scaling strategy 