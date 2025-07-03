#!/bin/bash
set -e

# Configuration
COMPOSE_FILE="docker-compose.backend.yml"
BACKUP_DIR="backups"
HEALTH_CHECK_TIMEOUT=300

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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
    BACKUP_NAME="backend_backup_$(date +%Y%m%d_%H%M%S)"
    
    # Backup Redis data if exists
    if docker volume ls | grep -q "redis_data"; then
        log_info "Backing up Redis data..."
        docker run --rm -v wisetale_redis_data:/data -v "$(pwd)/$BACKUP_DIR":/backup alpine \
            tar czf "/backup/${BACKUP_NAME}_redis.tar.gz" -C /data .
    fi
    
    # Backup environment files
    log_info "Backing up environment files..."
    tar czf "$BACKUP_DIR/${BACKUP_NAME}_env.tar.gz" \
        wisetale-api/.env* 2>/dev/null || true
    
    log_success "Backend backup created: $BACKUP_NAME"
}

# Check if environment files exist
check_env_files() {
    log_info "Checking environment files..."
    
    local missing_files=()
    
    if [ ! -f "wisetale-api/.env" ]; then
        missing_files+=("wisetale-api/.env")
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
    log_info "Building and starting backend services..."
    
    # Build images
    log_info "Building Docker images..."
    docker-compose -f "$COMPOSE_FILE" build --no-cache
    
    # Start services
    log_info "Starting services..."
    docker-compose -f "$COMPOSE_FILE" up -d
    
    log_success "Backend services started"
}

# Health check
health_check() {
    log_info "Performing backend health checks..."
    
    local start_time=$(date +%s)
    local timeout=$HEALTH_CHECK_TIMEOUT
    
    # Check backend health
    log_info "Checking backend API health..."
    while true; do
        if curl -f http://localhost:8000/health > /dev/null 2>&1; then
            log_success "Backend API is healthy"
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
    
    # Check Redis health
    log_info "Checking Redis health..."
    if docker exec wisetale-redis-prod redis-cli ping > /dev/null 2>&1; then
        log_success "Redis is healthy"
    else
        log_warning "Redis health check failed"
    fi
    
    log_success "All backend services are healthy"
}

# Show deployment status
show_status() {
    log_info "Backend Deployment Status:"
    echo ""
    
    # Show running containers
    docker-compose -f "$COMPOSE_FILE" ps
    echo ""
    
    # Show service URLs
    log_info "Backend Service URLs:"
    echo "  🔧 API: http://localhost:8000"
    echo "  📊 API Docs: http://localhost:8000/docs"
    echo "  📊 API Redoc: http://localhost:8000/redoc"
    echo "  💾 Redis: localhost:6379"
    echo ""
    
    # Show resource usage
    log_info "Resource Usage:"
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
}

# Rollback function
rollback() {
    log_warning "Rolling back deployment..."
    docker-compose -f "$COMPOSE_FILE" down
    log_info "Rollback completed. Please check the logs and fix issues before redeploying."
}

# Main deployment process
main() {
    log_info "Starting WiseTale Backend Deployment on Digital Ocean..."
    echo ""
    
    # Pre-deployment checks
    check_docker
    check_env_files
    
    # Create backup
    backup_deployment
    
    # Stop existing services
    log_info "Stopping existing backend services..."
    docker-compose -f "$COMPOSE_FILE" down --remove-orphans 2>/dev/null || true
    
    # Deploy new services
    deploy_services
    
    # Perform health checks
    if health_check; then
        show_status
        log_success "🚀 Backend deployment completed successfully!"
        echo ""
        log_info "Next steps:"
        echo "  1. Update your Vercel environment variables to point to this API"
        echo "  2. Test the API endpoints"
        echo "  3. Monitor the logs with: ./manage-backend.sh logs"
    else
        log_error "Health checks failed. Rolling back..."
        rollback
        exit 1
    fi
}

# Trap errors and rollback
trap 'log_error "Deployment failed!"; rollback; exit 1' ERR

# Run main function
main "$@" 