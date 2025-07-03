# 🚀 WiseTale Production Deployment Guide

Complete guide for deploying WiseTale to production with Docker, monitoring, and best practices.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Configuration](#configuration)
4. [Deployment](#deployment)
5. [Management](#management)
6. [Monitoring](#monitoring)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)

## 🔧 Prerequisites

### Required Software
- Docker & Docker Compose
- Git
- curl (for health checks)
- Domain name (for production)

### System Requirements
- **Minimum**: 2 CPU cores, 4GB RAM, 20GB disk
- **Recommended**: 4 CPU cores, 8GB RAM, 50GB disk

### API Keys & Services
- Supabase project
- OpenAI API key
- ElevenLabs API key
- Runway API key (optional)
- Pexels/Pixabay API keys
- Firebase project

## 🚀 Quick Start

### 1. Clone and Setup

```bash
git clone https://github.com/your-username/wisetale.git
cd wisetale
```

### 2. Create Environment Files

```bash
# Create production environment files
touch wisetale-api/.env.production
touch wisetale-app/.env.production
touch wisetale-landing/.env.production
```

Use the examples in `production-env-examples.md` to fill in your values.

### 3. Deploy

```bash
# Make scripts executable
chmod +x deploy.sh manage-prod.sh

# Deploy to production
./deploy.sh
```

### 4. Verify Deployment

```bash
# Check status
./manage-prod.sh status

# Check health
./manage-prod.sh health
```

## ⚙️ Configuration

### Environment Files Structure

```
wisetale-api/.env.production      # Backend API configuration
wisetale-app/.env.production      # Main app configuration
wisetale-landing/.env.production  # Landing page configuration
```

### Key Configuration Options

#### Backend API
- **Database**: Supabase connection strings
- **AI Services**: OpenAI, ElevenLabs, Runway API keys
- **Cache**: Redis configuration
- **Security**: JWT secrets, CORS settings

#### Frontend Apps
- **API**: Backend API endpoints
- **Firebase**: Authentication & analytics
- **Features**: Enable/disable features
- **SEO**: Meta tags and social media

### Docker Compose Files

```
docker-compose.yml          # Development setup
docker-compose.dev.yml      # Optimized development
docker-compose.prod.yml     # Production deployment
```

## 🎯 Deployment

### Production Deployment Script

```bash
./deploy.sh              # Full deployment
./deploy.sh backup       # Create backup only
./deploy.sh status       # Show deployment status
./deploy.sh health       # Check service health
```

### Manual Deployment Steps

```bash
# 1. Stop existing services
docker-compose -f docker-compose.prod.yml down

# 2. Build images
docker-compose -f docker-compose.prod.yml build --no-cache

# 3. Start services
docker-compose -f docker-compose.prod.yml up -d

# 4. Check health
curl -f http://localhost:80/health
```

## 🔧 Management

### Daily Operations

```bash
# Start services
./manage-prod.sh start

# Stop services
./manage-prod.sh stop

# Restart services
./manage-prod.sh restart

# View logs
./manage-prod.sh logs

# Monitor resources
./manage-prod.sh monitor
```

### Service-Specific Commands

```bash
# API logs
./manage-prod.sh logs-api

# App logs
./manage-prod.sh logs-app

# Landing logs
./manage-prod.sh logs-landing

# Open API shell
./manage-prod.sh shell-api
```

### Maintenance Commands

```bash
# Create backup
./manage-prod.sh backup

# Clean up unused resources
./manage-prod.sh cleanup

# Check service health
./manage-prod.sh health
```

## 📊 Monitoring

### Health Checks

All services include built-in health checks:

- **API**: `http://localhost:8000/health`
- **App**: `http://localhost:3001/api/health`
- **Landing**: `http://localhost:3000/api/health`
- **Nginx**: `http://localhost:80/health`

### Resource Monitoring

```bash
# Real-time stats
./manage-prod.sh monitor

# Container status
docker-compose -f docker-compose.prod.yml ps

# Resource usage
docker stats --no-stream
```

### Logs

```bash
# All service logs
./manage-prod.sh logs

# Follow logs in real-time
docker-compose -f docker-compose.prod.yml logs -f

# Service-specific logs
docker-compose -f docker-compose.prod.yml logs backend
```

## 🔍 Troubleshooting

### Common Issues

#### Service Won't Start
```bash
# Check logs
./manage-prod.sh logs

# Check container status
docker-compose -f docker-compose.prod.yml ps

# Rebuild and restart
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

#### Database Connection Issues
```bash
# Check Supabase configuration
./manage-prod.sh shell-api
# Inside container:
env | grep SUPABASE
```

#### Memory Issues
```bash
# Check resource usage
./manage-prod.sh monitor

# Increase memory limits in docker-compose.prod.yml
# Restart services
./manage-prod.sh restart
```

### Debug Commands

```bash
# Check environment variables
./manage-prod.sh shell-api
env | grep -E "(SUPABASE|OPENAI|REDIS)"

# Test API directly
curl -f http://localhost:8000/docs

# Check Docker resources
docker system df
docker system prune -f
```

## 🏆 Best Practices

### Security

1. **Never commit secrets** - Use environment files
2. **Use strong secrets** - Generate secure JWT keys
3. **Enable CORS** - Restrict to your domains
4. **Use HTTPS** - In production with SSL certificates
5. **Regular updates** - Keep dependencies updated

### Performance

1. **Resource limits** - Set appropriate CPU/memory limits
2. **Caching** - Use Redis for API responses
3. **CDN** - Serve static assets from CDN
4. **Image optimization** - Use optimized Docker images
5. **Database indexing** - Index frequently queried fields

### Reliability

1. **Health checks** - Monitor service health
2. **Backups** - Regular automated backups
3. **Logging** - Comprehensive logging for debugging
4. **Monitoring** - Real-time resource monitoring
5. **Graceful shutdowns** - Handle container stops properly

### Scalability

1. **Horizontal scaling** - Multiple container instances
2. **Load balancing** - Use Nginx for load balancing
3. **Database optimization** - Connection pooling
4. **Cache optimization** - Redis clustering
5. **Asset optimization** - CDN and compression

## 📝 Service URLs

After deployment, your services will be available at:

- **🌐 Landing Page**: http://localhost:3000
- **🎯 Main App**: http://localhost:3001
- **🔧 API**: http://localhost:8000
- **📊 API Documentation**: http://localhost:8000/docs
- **🔍 Health Check**: http://localhost:80/health

## 🆘 Support

If you encounter issues:

1. Check the [troubleshooting section](#troubleshooting)
2. Review service logs: `./manage-prod.sh logs`
3. Verify environment configuration
4. Check Docker resources: `docker system df`
5. Create an issue with logs and system information

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [Firebase Analytics](https://firebase.google.com/docs/analytics)
- [Supabase Documentation](https://supabase.com/docs)

---

**🎉 Happy Deploying!** Your WiseTale application is now production-ready! 