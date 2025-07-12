#!/bin/bash

# Wizetale Production Management Script
# Quick commands for managing production deployment

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

COMPOSE_FILE="docker-compose.prod.yml"

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

# Show help
show_help() {
    echo "Wizetale Production Management Commands:"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start       Start all services"
    echo "  stop        Stop all services"
    echo "  restart     Restart all services"
    echo "  status      Show service status"
    echo "  logs        Show logs (all services)"
    echo "  logs-api    Show API logs"
    echo "  logs-app    Show app logs"
    echo "  logs-landing Show landing logs"
    echo "  shell-api   Open shell in API container"
    echo "  shell-app   Open shell in app container"
    echo "  backup      Create backup"
    echo "  cleanup     Clean up unused images and containers"
    echo "  monitor     Monitor resource usage"
    echo "  health      Check service health"
    echo "  deploy      Full deployment (use deploy.sh)"
    echo "  help        Show this help"
}

# Start services
start_services() {
    log_info "Starting all services..."
    docker-compose -f "$COMPOSE_FILE" up -d
    log_success "Services started"
    show_status
}

# Stop services
stop_services() {
    log_info "Stopping all services..."
    docker-compose -f "$COMPOSE_FILE" down
    log_success "Services stopped"
}

# Restart services
restart_services() {
    log_info "Restarting all services..."
    docker-compose -f "$COMPOSE_FILE" restart
    log_success "Services restarted"
    show_status
}

# Show status
show_status() {
    log_info "Service Status:"
    docker-compose -f "$COMPOSE_FILE" ps
    echo ""
    
    log_info "Service URLs:"
    echo "  🌐 Landing Page: http://localhost:3000"
    echo "  🎯 Main App: http://localhost:3001"
    echo "  🔧 API: http://localhost:8000"
    echo "  📊 API Docs: http://localhost:8000/docs"
    echo "  🔍 Health Check: http://localhost:80/health"
}

# Show logs
show_logs() {
    local service=${1:-}
    
    if [ -z "$service" ]; then
        log_info "Showing logs for all services..."
        docker-compose -f "$COMPOSE_FILE" logs -f --tail=100
    else
        log_info "Showing logs for $service..."
        docker-compose -f "$COMPOSE_FILE" logs -f --tail=100 "$service"
    fi
}

# Open shell
open_shell() {
    local service=$1
    local container_name
    
    case $service in
        "api")
            container_name="wizetale-backend-prod"
            ;;
        "app")
            container_name="wizetale-frontend-prod"
            ;;
        "landing")
            container_name="wizetale-landing-prod"
            ;;
        *)
            log_error "Invalid service: $service"
            return 1
            ;;
    esac
    
    log_info "Opening shell in $container_name..."
    docker exec -it "$container_name" /bin/sh
}

# Backup
create_backup() {
    ./deploy.sh backup
}

# Cleanup
cleanup() {
    log_info "Cleaning up unused Docker resources..."
    
    # Remove unused containers
    docker container prune -f
    
    # Remove unused images
    docker image prune -f
    
    # Remove unused volumes (be careful with this)
    log_warning "Removing unused volumes..."
    docker volume prune -f
    
    # Remove unused networks
    docker network prune -f
    
    log_success "Cleanup completed"
}

# Monitor
monitor() {
    log_info "Monitoring resource usage (press Ctrl+C to stop)..."
    docker stats wizetale-backend-prod wizetale-frontend-prod wizetale-landing-prod wizetale-redis-prod wizetale-nginx-prod
}

# Health check
health_check() {
    log_info "Checking service health..."
    
    # Check if containers are running
    local unhealthy_services=()
    
    for service in backend frontend landing redis nginx; do
        if ! docker-compose -f "$COMPOSE_FILE" ps "$service" | grep -q "Up"; then
            unhealthy_services+=("$service")
        fi
    done
    
    if [ ${#unhealthy_services[@]} -ne 0 ]; then
        log_error "Unhealthy services:"
        for service in "${unhealthy_services[@]}"; do
            log_error "  - $service"
        done
        return 1
    fi
    
    # Check HTTP endpoints
    local endpoints=(
        "http://localhost:8000/health:API"
        "http://localhost:3001/api/health:Frontend"
        "http://localhost:3000/api/health:Landing"
        "http://localhost:80/health:Nginx"
    )
    
    for endpoint in "${endpoints[@]}"; do
        local url="${endpoint%:*}"
        local name="${endpoint#*:}"
        
        if curl -f -s "$url" > /dev/null; then
            log_success "$name is healthy"
        else
            log_error "$name is not responding"
        fi
    done
}

# Main command handler
case "${1:-help}" in
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
        show_logs "backend"
        ;;
    "logs-app")
        show_logs "frontend"
        ;;
    "logs-landing")
        show_logs "landing"
        ;;
    "shell-api")
        open_shell "api"
        ;;
    "shell-app")
        open_shell "app"
        ;;
    "shell-landing")
        open_shell "landing"
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
        health_check
        ;;
    "deploy")
        log_info "Running full deployment..."
        ./deploy.sh
        ;;
    "help"|*)
        show_help
        ;;
esac 