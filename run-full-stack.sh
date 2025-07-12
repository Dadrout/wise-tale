#!/bin/bash
echo "🚀 Starting Wizetale Full Stack..."

# Stop on error
set -e

# Go to backend and start it in the background
echo "-> Starting Backend..."
cd wizetale-api
docker compose up -d --build
cd ..

# Go to frontend and start it in the background
echo "-> Starting Frontend..."
cd wizetale-app
npm i
npm run dev &
cd ..

echo "✅ Wizetale Stack Started Successfully!"
echo "   - Backend API available at http://localhost:8000"
echo "   - Frontend App available at http://localhost:3000" 