#!/bin/bash
echo "🛑 Stopping Wizetale Stack..."

# Stop on error
set -e

# Stop backend
echo "-> Stopping Backend..."
cd wizetale-api
docker compose down
cd ..

# Stop frontend
echo "-> Stopping Frontend..."
if [ -f wizetale-app/node_modules/.bin/next ]; then
    kill $(lsof -t -i:3000) > /dev/null 2>&1 || true
fi


echo "✅ Wizetale Stack Stopped Successfully!" 