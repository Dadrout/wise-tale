#!/bin/bash

echo "🛑 Stopping WiseTale Stack..."

# Stop Docker services
echo "📦 Stopping Docker containers..."
docker-compose down

# Stop backend if PID file exists
if [ -f .backend_pid ]; then
    BACKEND_PID=$(cat .backend_pid)
    echo "📡 Stopping Backend API (PID: $BACKEND_PID)..."
    kill $BACKEND_PID 2>/dev/null
    rm .backend_pid
else
    echo "📡 Stopping any running backend processes..."
    pkill -f "uvicorn app.main:app"
fi

echo "✅ WiseTale Stack Stopped Successfully!" 