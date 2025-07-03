#!/bin/bash

echo "🚀 Starting WiseTale Full Stack..."

# Start backend locally
echo "📡 Starting Backend API (local)..."
cd wisetale-api
source .venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
cd ..

# Start frontend and landing via Docker
echo "🎨 Starting Frontend & Landing (Docker)..."
docker-compose up frontend landing -d

echo ""
echo "✅ WiseTale Stack Started Successfully!"
echo ""
echo "🌐 Services available at:"
echo "   • Backend API:  http://localhost:8000"
echo "   • Main App:     http://localhost:3001" 
echo "   • Landing Page: http://localhost:3000"
echo ""
echo "📝 To stop all services:"
echo "   • Backend: kill $BACKEND_PID"
echo "   • Docker:  docker-compose down"
echo ""

# Save backend PID for easy cleanup
echo $BACKEND_PID > .backend_pid

echo "💡 Use './stop-stack.sh' to stop all services" 