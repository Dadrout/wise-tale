#!/bin/bash

# WiseTale Production Deployment Script
# This script handles the full deployment process to a remote server.

set -e # Exit on any error

# --- Configuration ---
SERVER_USER="root"
SERVER_IP="138.197.191.222"
PROJECT_DIR="/root/WiseTale"
COMPOSE_FILE="docker-compose.yml"

# --- Colors ---
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# --- Functions ---
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# --- Main Script ---
log_info "🚀 Starting deployment to $SERVER_IP..."

# SSH into the server and execute deployment commands
ssh $SERVER_USER@$SERVER_IP << EOF
    set -e
    
    # --- Colors ---
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    BLUE='\033[0;34m'
    NC='\033[0m' # No Color

    # --- Functions ---
    log_info() { echo -e "\${BLUE}[INFO]\${NC} \$1"; }
    log_success() { echo -e "\${GREEN}[SUCCESS]\${NC} \$1"; }
    
    log_info "Navigating to project directory: $PROJECT_DIR"
    cd $PROJECT_DIR

    log_info "Resetting local changes..."
    git reset --hard HEAD
    
    log_info "Pulling latest changes from git..."
    git pull origin main
    
    log_info "Stopping current services..."
    docker compose -f $COMPOSE_FILE down --remove-orphans
    
    log_info "Building and starting new services..."
    docker compose -f $COMPOSE_FILE up --build -d
    
    log_info "Waiting for services to start..."
    sleep 15
    
    log_info "Deployment status:"
    docker compose -f $COMPOSE_FILE ps
EOF

log_success "✅ Deployment to $SERVER_IP finished successfully!"
log_info "Check the application at http://$SERVER_IP" 