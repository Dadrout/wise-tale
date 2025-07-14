# 🔄 Load Balancer Setup for Wizetale

Complete guide for setting up and managing load balancing with Nginx for Wizetale application.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Setup](#setup)
4. [Configuration](#configuration)
5. [Scaling](#scaling)
6. [Monitoring](#monitoring)
7. [Troubleshooting](#troubleshooting)

## 🎯 Overview

The load balancer setup uses **Nginx** as a reverse proxy to distribute traffic across multiple backend and frontend instances. This provides:

- **High Availability**: If one instance fails, traffic is routed to healthy instances
- **Scalability**: Easy to add more instances to handle increased load
- **Performance**: Better resource utilization and response times
- **Security**: Centralized SSL termination and security headers

## 🏗️ Architecture

```
Internet → Nginx (Load Balancer) → Multiple Backend/Frontend Instances
                                    ↓
                              Redis (Shared Cache)
```

### Components

- **Nginx**: Reverse proxy and load balancer
- **Backend**: FastAPI application instances
- **Frontend**: Next.js application instances  
- **Redis**: Shared cache and session storage

## ⚙️ Setup

### 1. Production Deployment

```bash
# Deploy with load balancer
docker-compose -f docker-compose.prod.yml up -d

# Verify all services are running
docker-compose -f docker-compose.prod.yml ps
```

### 2. Check Load Balancer Status

```bash
# Health check
curl http://localhost/health

# Load balancer status
curl http://localhost/status

# Service health
curl http://localhost/api/health
```

## 🔧 Configuration

### Nginx Configuration Features

The `nginx.conf` includes:

- **Round-robin load balancing** (default)
- **Health checks** with failover
- **Rate limiting** for different endpoints
- **SSL/TLS support** (commented out)
- **Compression** and caching
- **Security headers**

### Key Configuration Sections

#### Upstream Servers
```nginx
upstream backend {
    server backend:8000 max_fails=3 fail_timeout=30s;
    # Add more instances here
    keepalive 32;
}

upstream frontend {
    server frontend:3001 max_fails=3 fail_timeout=30s;
    # Add more instances here
    keepalive 32;
}
```

#### Rate Limiting
```nginx
# API endpoints: 10 requests/second
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

# Video generation: 2 requests/second (resource intensive)
limit_req_zone $binary_remote_addr zone=video_generation:10m rate=2r/s;

# General traffic: 5 requests/second
limit_req_zone $binary_remote_addr zone=general:10m rate=5r/s;
```

#### Health Checks
```nginx
# Backend health check
location /api/health {
    proxy_pass http://backend/health;
    access_log off;
}
```

## 📈 Scaling

### Using the Scaling Script

```bash
# Show current status
./scale-services.sh status

# Scale backend to 3 instances
./scale-services.sh scale-backend 3

# Scale frontend to 2 instances
./scale-services.sh scale-frontend 2

# Scale both to 3 instances
./scale-services.sh scale-all 3

# Show metrics
./scale-services.sh metrics
```

### Manual Scaling

```bash
# Scale backend
docker-compose -f docker-compose.prod.yml up -d --scale backend=3

# Scale frontend
docker-compose -f docker-compose.prod.yml up -d --scale frontend=2

# Restart nginx to pick up changes
docker-compose -f docker-compose.prod.yml restart nginx
```

### Adding More Instances

To add more backend instances:

1. **Update nginx.conf**:
```nginx
upstream backend {
    server backend:8000 max_fails=3 fail_timeout=30s;
    server backend2:8000 max_fails=3 fail_timeout=30s;
    server backend3:8000 max_fails=3 fail_timeout=30s;
    keepalive 32;
}
```

2. **Update docker-compose.prod.yml**:
```yaml
services:
  backend:
    # ... existing config
  backend2:
    build:
      context: ./wizetale-api
      target: production
    image: wizetale-backend:latest
    container_name: wizetale-backend-prod-2
    # ... same config as backend
  backend3:
    # ... same config
```

## 📊 Monitoring

### Health Checks

```bash
# Load balancer health
curl http://localhost/health

# Backend health
curl http://localhost/api/health

# Frontend health
curl http://localhost/api/health

# Nginx status
curl http://localhost/status
```

### Metrics and Logs

```bash
# View all logs
docker-compose -f docker-compose.prod.yml logs

# View nginx logs
docker-compose -f docker-compose.prod.yml logs nginx

# View backend logs
docker-compose -f docker-compose.prod.yml logs backend

# Resource usage
docker stats --no-stream
```

### Performance Monitoring

```bash
# Check response times
curl -w "@curl-format.txt" -o /dev/null -s http://localhost/api/health

# Load test (install apache2-utils first)
ab -n 1000 -c 10 http://localhost/api/health
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Service Not Responding
```bash
# Check if services are running
docker-compose -f docker-compose.prod.yml ps

# Check logs
docker-compose -f docker-compose.prod.yml logs nginx
docker-compose -f docker-compose.prod.yml logs backend

# Restart services
docker-compose -f docker-compose.prod.yml restart
```

#### 2. Load Balancer Not Working
```bash
# Check nginx configuration
docker exec wizetale-nginx-prod nginx -t

# Reload nginx configuration
docker exec wizetale-nginx-prod nginx -s reload

# Check nginx status
docker exec wizetale-nginx-prod nginx -s status
```

#### 3. High Memory Usage
```bash
# Check resource usage
docker stats --no-stream

# Scale down if needed
./scale-services.sh scale-backend 1
./scale-services.sh scale-frontend 1
```

#### 4. Rate Limiting Issues
```bash
# Check nginx error logs
docker exec wizetale-nginx-prod tail -f /var/log/nginx/error.log

# Temporarily disable rate limiting (not recommended for production)
# Comment out limit_req lines in nginx.conf and reload
```

### Debug Commands

```bash
# Test nginx configuration
docker exec wizetale-nginx-prod nginx -t

# Check upstream servers
docker exec wizetale-nginx-prod nginx -T | grep upstream

# Monitor real-time logs
docker-compose -f docker-compose.prod.yml logs -f nginx

# Check network connectivity
docker exec wizetale-nginx-prod ping backend
docker exec wizetale-nginx-prod ping frontend
```

## 🚀 Best Practices

### Performance

1. **Monitor resource usage** regularly
2. **Scale horizontally** before hitting limits
3. **Use caching** for static assets
4. **Enable compression** for text-based responses
5. **Set appropriate timeouts** for different endpoints

### Security

1. **Enable HTTPS** in production
2. **Use rate limiting** to prevent abuse
3. **Set security headers** (already configured)
4. **Monitor access logs** for suspicious activity
5. **Keep nginx updated** regularly

### Reliability

1. **Use health checks** for all services
2. **Implement graceful shutdowns**
3. **Set up monitoring** and alerting
4. **Create backups** regularly
5. **Test failover** scenarios

## 📝 Configuration Files

### Key Files

- `docker-compose.prod.yml` - Production services configuration
- `nginx.conf` - Load balancer configuration
- `scale-services.sh` - Scaling management script
- `manage-prod.sh` - Production management script

### Environment Variables

Make sure these are set in your `.env` files:

```bash
# Backend
REDIS_URL=redis://redis:6379
ENVIRONMENT=production

# Frontend
NODE_ENV=production
NEXT_PUBLIC_API_URL=http://backend:8000
```

## 🎉 Next Steps

1. **Deploy to production** using the load balancer
2. **Monitor performance** and scale as needed
3. **Set up SSL certificates** for HTTPS
4. **Configure monitoring** and alerting
5. **Test failover scenarios**

---

**🎯 Your Wizetale application is now ready for production with load balancing!** 