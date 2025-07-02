#!/bin/bash

# WiseTale Ultra-Fast Development Setup 🚀
# Максимально оптимизированный workflow для разработки

echo "🚀 WiseTale Ultra-Fast Development Setup"
echo "========================================"

# Enable BuildKit for faster builds
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check dependencies
echo "📋 Checking dependencies..."
if ! command_exists docker; then
    echo "❌ Docker not found. Please install Docker first."
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm not found. Please install Node.js first."
    exit 1
fi

echo "✅ Dependencies OK"
echo "🔧 BuildKit enabled for ultra-fast builds"

# Build options
echo ""
echo "🎯 Choose your development mode:"
echo "1) 🐳 Ultra-Fast Docker (BuildKit + cache) - FASTEST BUILD"
echo "2) 🔥 API Docker + Frontend Native - RECOMMENDED"  
echo "3) ⚡ API only (wisetale-api) - API development"
echo "4) 🌐 Frontend only (native) - Frontend development"
echo "5) 🚀 Super Fast: Use existing containers - INSTANT"
echo ""
read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo "🔧 Building ultra-fast Docker with BuildKit + cache..."
        echo "💡 Using BuildKit cache mounts for maximum speed"
        docker-compose -f docker-compose.dev.yml down
        docker-compose -f docker-compose.dev.yml build --parallel
        docker-compose -f docker-compose.dev.yml up
        ;;
    2)
        echo "🔧 Building API only, frontend natively..."
        echo "💡 This is the FASTEST for frontend development"
        docker-compose -f docker-compose.dev.yml down
        docker-compose -f docker-compose.dev.yml up -d backend --build
        echo ""
        echo "🎯 Backend started! Now run frontend:"
        echo "cd wisetale-app && npm run dev"
        echo ""
        echo "🌐 Or landing:"  
        echo "cd wisetale-landing && npm run dev"
        echo ""
        echo "📺 URLs:"
        echo "- API: http://localhost:8000"
        echo "- App: http://localhost:3001 (after npm run dev)"
        echo "- Landing: http://localhost:3000 (after npm run dev)"
        ;;
    3)
        echo "🔧 Building API only..."
        docker-compose -f docker-compose.dev.yml down
        docker-compose -f docker-compose.dev.yml up backend --build
        ;;
    4)
        echo "🔧 Running frontend only (native)..."
        echo "💡 Make sure API is running separately!"
        echo ""
        echo "Choose frontend:"
        echo "1) Main App (port 3001)"
        echo "2) Landing (port 3000)"
        read -p "Choice (1-2): " frontend_choice
        
        case $frontend_choice in
            1)
                echo "🚀 Starting main app..."
                cd wisetale-app && npm run dev
                ;;
            2)
                echo "🚀 Starting landing..."
                cd wisetale-landing && npm run dev
                ;;
            *)
                echo "❌ Invalid choice"
                exit 1
                ;;
        esac
        ;;
    5)
        echo "🚀 Using existing containers - INSTANT START!"
        echo "💡 Starting containers without rebuild"
        docker-compose -f docker-compose.dev.yml up -d
        echo ""
        echo "📺 URLs:"
        echo "- API: http://localhost:8000"
        echo "- Frontend: http://localhost:3001"
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "🎉 Development environment ready!"
echo "💡 Pro tip: Use option 2 for fastest frontend development"
echo "💡 Pro tip: Use option 5 for instant restarts" 