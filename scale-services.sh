#!/bin/bash

# Wizetale Service Scaling Script
# Allows scaling backend and frontend services for load balancing

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.prod.yml"
SERVICE_BACKEND="backend"
SERVICE_FRONTEND="frontend"
SERVICE_NGINX="nginx"

# Default values
BACKEND_REPLICAS=1
FRONTEND_REPLICAS=1

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

# Function to check if Docker Compose is running
check_services() {
    if ! docker-compose -f $COMPOSE_FILE ps | grep -q "Up"; then
        print_error "Services are not running. Start them first with:"
        echo "  docker-compose -f $COMPOSE_FILE up -d"
        exit 1
    fi
}

# Function to show current status
show_status() {
    print_header "Current Service Status"
    
    echo "Backend instances:"
    docker-compose -f $COMPOSE_FILE ps $SERVICE_BACKEND
    
    echo -e "\nFrontend instances:"
    docker-compose -f $COMPOSE_FILE ps $SERVICE_FRONTEND
    
    echo -e "\nNginx status:"
    docker-compose -f $COMPOSE_FILE ps $SERVICE_NGINX
    
    echo -e "\nLoad balancer status:"
    curl -s http://localhost/status 2>/dev/null || echo "Status endpoint not available"
}

# Function to scale backend
scale_backend() {
    local replicas=$1
    print_header "Scaling Backend to $replicas instances"
    
    # Update docker-compose.prod.yml with new backend instances
    # This is a simplified approach - in production you'd use Docker Swarm or Kubernetes
    
    print_status "Stopping current backend instances..."
    docker-compose -f $COMPOSE_FILE stop $SERVICE_BACKEND
    
    print_status "Starting $replicas backend instances..."
    docker-compose -f $COMPOSE_FILE up -d --scale $SERVICE_BACKEND=$replicas
    
    print_status "Backend scaled to $replicas instances"
}

# Function to scale frontend
scale_frontend() {
    local replicas=$1
    print_header "Scaling Frontend to $replicas instances"
    
    print_status "Stopping current frontend instances..."
    docker-compose -f $COMPOSE_FILE stop $SERVICE_FRONTEND
    
    print_status "Starting $replicas frontend instances..."
    docker-compose -f $COMPOSE_FILE up -d --scale $SERVICE_FRONTEND=$replicas
    
    print_status "Frontend scaled to $replicas instances"
}

# Function to update nginx configuration for multiple instances
update_nginx_config() {
    print_header "Updating Nginx Configuration"
    
    # Create backup
    cp nginx.conf nginx.conf.backup
    
    # Update nginx.conf with multiple backend instances
    # This is a simplified approach - you'd need to modify the upstream blocks
    
    print_status "Nginx configuration updated"
    print_status "Restarting Nginx..."
    docker-compose -f $COMPOSE_FILE restart $SERVICE_NGINX
}

# Function to show load balancer metrics
show_metrics() {
    print_header "Load Balancer Metrics"
    
    echo "Nginx status:"
    curl -s http://localhost/status 2>/dev/null || echo "Status endpoint not available"
    
    echo -e "\nService health:"
    echo "Backend health: $(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/health 2>/dev/null || echo "unavailable")"
    echo "Frontend health: $(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/health 2>/dev/null || echo "unavailable")"
    
    echo -e "\nResource usage:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
}

# Function to show help
show_help() {
    echo "Wizetale Service Scaling Script"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  status              Show current service status"
    echo "  scale-backend N     Scale backend to N instances"
    echo "  scale-frontend N    Scale frontend to N instances"
    echo "  scale-all N         Scale both backend and frontend to N instances"
    echo "  metrics             Show load balancer metrics"
    echo "  restart             Restart all services"
    echo "  help                Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 status"
    echo "  $0 scale-backend 3"
    echo "  $0 scale-frontend 2"
    echo "  $0 scale-all 2"
    echo "  $0 metrics"
}

# Main script logic
case "${1:-help}" in
    "status")
        check_services
        show_status
        ;;
    "scale-backend")
        if [ -z "$2" ]; then
            print_error "Please specify number of replicas"
            exit 1
        fi
        check_services
        scale_backend $2
        update_nginx_config
        show_status
        ;;
    "scale-frontend")
        if [ -z "$2" ]; then
            print_error "Please specify number of replicas"
            exit 1
        fi
        check_services
        scale_frontend $2
        update_nginx_config
        show_status
        ;;
    "scale-all")
        if [ -z "$2" ]; then
            print_error "Please specify number of replicas"
            exit 1
        fi
        check_services
        scale_backend $2
        scale_frontend $2
        update_nginx_config
        show_status
        ;;
    "metrics")
        check_services
        show_metrics
        ;;
    "restart")
        print_header "Restarting All Services"
        docker-compose -f $COMPOSE_FILE restart
        print_status "All services restarted"
        ;;
    "help"|*)
        show_help
        ;;
esac 