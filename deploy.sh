#!/bin/bash

# Wizetale Production Deployment Script
# This script handles the full deployment process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.prod.yml"
BACKUP_DIR="backups"
HEALTH_CHECK_TIMEOUT=300  # 5 minutes

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Create backup of current deployment
backup_deployment() {
    log_info "Creating backup of current deployment..."
    
    mkdir -p "$BACKUP_DIR"
    BACKUP_NAME="backup_$(date +%Y%m%d_%H%M%S)"
    
    # Backup Redis data if exists
    if docker volume ls | grep -q "redis_data"; then
        log_info "Backing up Redis data..."
        docker run --rm -v wizetale_redis_data:/data -v "$(pwd)/$BACKUP_DIR":/backup alpine \
            tar czf "/backup/${BACKUP_NAME}_redis.tar.gz" -C /data .
    fi
    
    # Backup environment files
    log_info "Backing up environment files..."
    tar czf "$BACKUP_DIR/${BACKUP_NAME}_env.tar.gz" \
        wizetale-api/.env* wizetale-app/.env* wizetale-landing/.env* 2>/dev/null || true
    
    log_success "Backup created: $BACKUP_NAME"
}

# Check if environment files exist
check_env_files() {
    log_info "Checking environment files..."
    
    local missing_files=()
    
    if [ ! -f "wizetale-api/.env" ]; then
        missing_files+=("wizetale-api/.env")
    fi
    
    if [ ! -f "wizetale-app/.env" ]; then
        missing_files+=("wizetale-app/.env")
    fi
    
    if [ ! -f "wizetale-landing/.env" ]; then
        missing_files+=("wizetale-landing/.env")
    fi
    
    if [ ${#missing_files[@]} -ne 0 ]; then
        log_error "Missing environment files:"
        for file in "${missing_files[@]}"; do
            log_error "  - $file"
        done
        log_info "Please create these files before deploying."
        exit 1
    fi
    
    log_success "All environment files present"
}

# Build and start services
deploy_services() {
    log_info "Building and starting services..."
    
    # Build images
    log_info "Building Docker images..."
    docker-compose -f "$COMPOSE_FILE" build --no-cache
    
    # Start services
    log_info "Starting services..."
    docker-compose -f "$COMPOSE_FILE" up -d
    
    log_success "Services started"
}

# Health check
health_check() {
    log_info "Performing health checks..."
    
    local start_time=$(date +%s)
    local timeout=$HEALTH_CHECK_TIMEOUT
    
    # Check backend health
    log_info "Checking backend health..."
    while true; do
        if curl -f http://localhost:8000/health > /dev/null 2>&1; then
            log_success "Backend is healthy"
            break
        fi
        
        local current_time=$(date +%s)
        local elapsed=$((current_time - start_time))
        
        if [ $elapsed -gt $timeout ]; then
            log_error "Backend health check timeout"
            return 1
        fi
        
        sleep 5
    done
    
    # Check frontend health
    log_info "Checking frontend health..."
    while true; do
        if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
            log_success "Frontend is healthy"
            break
        fi
        
        local current_time=$(date +%s)
        local elapsed=$((current_time - start_time))
        
        if [ $elapsed -gt $timeout ]; then
            log_error "Frontend health check timeout"
            return 1
        fi
        
        sleep 5
    done
    
    # Check landing page health
    log_info "Checking landing page health..."
    while true; do
        if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
            log_success "Landing page is healthy"
            break
        fi
        
        local current_time=$(date +%s)
        local elapsed=$((current_time - start_time))
        
        if [ $elapsed -gt $timeout ]; then
            log_error "Landing page health check timeout"
            return 1
        fi
        
        sleep 5
    done
    
    log_success "All services are healthy"
}

# Show deployment status
show_status() {
    log_info "Deployment Status:"
    echo ""
    
    # Show running containers
    docker-compose -f "$COMPOSE_FILE" ps
    echo ""
    
    # Show service URLs
    log_info "Service URLs:"
    echo "  🌐 Landing Page: http://localhost:3000"
    echo "  🎯 Main App: http://localhost:3001"
    echo "  🔧 API: http://localhost:8000"
    echo "  📊 API Docs: http://localhost:8000/docs"
    echo ""
    
    # Show resource usage
    log_info "Resource Usage:"
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
}

# Main deployment process
main() {
    log_info "Starting Wizetale Production Deployment..."
    echo ""
    
    # Pre-deployment checks
    check_docker
    check_env_files
    
    # Create backup
    backup_deployment
    
    # Stop existing services
    log_info "Stopping existing services..."
    docker-compose -f "$COMPOSE_FILE" down --remove-orphans 2>/dev/null || true
    
    # Deploy new services
    deploy_services
    
    # Health checks
    if health_check; then
        log_success "Deployment completed successfully!"
        show_status
    else
        log_error "Deployment failed health checks"
        log_info "Rolling back..."
        docker-compose -f "$COMPOSE_FILE" down
        exit 1
    fi
}

# Handle script arguments
case "${1:-}" in
    "backup")
        backup_deployment
        ;;
    "status")
        show_status
        ;;
    "health")
        health_check
        ;;
    *)
        main
        ;;
esac 