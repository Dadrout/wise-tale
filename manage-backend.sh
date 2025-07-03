#!/bin/bash

# WiseTale Backend Management Script for Digital Ocean
# Usage: ./manage-backend.sh [command]

COMPOSE_FILE="docker-compose.backend.yml"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

show_help() {
    echo "WiseTale Backend Management Commands:"
    echo ""
    echo "  start       Start all backend services"
    echo "  stop        Stop all backend services"
    echo "  restart     Restart all backend services"
    echo "  status      Show service status"
    echo "  logs        Show logs for all services"
    echo "  logs-api    Show API logs only"
    echo "  logs-redis  Show Redis logs only"
    echo "  shell-api   Access API container shell"
    echo "  shell-redis Access Redis CLI"
    echo "  backup      Create backup of Redis data"
    echo "  cleanup     Remove unused images and volumes"
    echo "  monitor     Show real-time resource usage"
    echo "  health      Check service health"
    echo "  update      Pull latest images and restart"
    echo ""
}

start_services() {
    log_info "Starting backend services..."
    docker-compose -f "$COMPOSE_FILE" up -d
    log_success "Backend services started"
}

stop_services() {
    log_info "Stopping backend services..."
    docker-compose -f "$COMPOSE_FILE" down
    log_success "Backend services stopped"
}

restart_services() {
    log_info "Restarting backend services..."
    docker-compose -f "$COMPOSE_FILE" restart
    log_success "Backend services restarted"
}

show_status() {
    log_info "Backend Service Status:"
    docker-compose -f "$COMPOSE_FILE" ps
    echo ""
    
    log_info "Service URLs:"
    echo "  🔧 API: http://localhost:8000"
    echo "  📊 API Docs: http://localhost:8000/docs"
    echo "  💾 Redis: localhost:6379"
}

show_logs() {
    if [ "$1" = "api" ]; then
        docker-compose -f "$COMPOSE_FILE" logs -f backend
    elif [ "$1" = "redis" ]; then
        docker-compose -f "$COMPOSE_FILE" logs -f redis
    else
        docker-compose -f "$COMPOSE_FILE" logs -f
    fi
}

access_shell() {
    if [ "$1" = "api" ]; then
        docker-compose -f "$COMPOSE_FILE" exec backend /bin/bash
    elif [ "$1" = "redis" ]; then
        docker-compose -f "$COMPOSE_FILE" exec redis redis-cli
    else
        log_error "Specify 'api' or 'redis'"
    fi
}

create_backup() {
    log_info "Creating Redis backup..."
    mkdir -p backups
    BACKUP_NAME="redis_backup_$(date +%Y%m%d_%H%M%S)"
    
    docker run --rm -v wisetale_redis_data:/data -v "$(pwd)/backups":/backup alpine \
        tar czf "/backup/${BACKUP_NAME}.tar.gz" -C /data .
    
    log_success "Backup created: backups/${BACKUP_NAME}.tar.gz"
}

cleanup() {
    log_info "Cleaning up unused Docker resources..."
    docker system prune -f
    docker volume prune -f
    log_success "Cleanup completed"
}

monitor() {
    log_info "Real-time resource monitoring (Ctrl+C to exit):"
    docker stats
}

check_health() {
    log_info "Checking service health..."
    
    # Check API
    if curl -f http://localhost:8000/health > /dev/null 2>&1; then
        log_success "✅ API is healthy"
    else
        log_error "❌ API is not responding"
    fi
    
    # Check Redis
    if docker exec wisetale-redis-prod redis-cli ping > /dev/null 2>&1; then
        log_success "✅ Redis is healthy"
    else
        log_error "❌ Redis is not responding"
    fi
}

update_services() {
    log_info "Updating services..."
    docker-compose -f "$COMPOSE_FILE" pull
    docker-compose -f "$COMPOSE_FILE" up -d --force-recreate
    log_success "Services updated"
}

# Main command handler
case "$1" in
    "start")
        start_services
        ;;
    "stop")
        stop_services
        ;;
    "restart")
        restart_services
        ;;
    "status")
        show_status
        ;;
    "logs")
        show_logs
        ;;
    "logs-api")
        show_logs "api"
        ;;
    "logs-redis")
        show_logs "redis"
        ;;
    "shell-api")
        access_shell "api"
        ;;
    "shell-redis")
        access_shell "redis"
        ;;
    "backup")
        create_backup
        ;;
    "cleanup")
        cleanup
        ;;
    "monitor")
        monitor
        ;;
    "health")
        check_health
        ;;
    "update")
        update_services
        ;;
    "help"|"--help"|"-h"|"")
        show_help
        ;;
    *)
        log_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac 