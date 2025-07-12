#!/bin/bash

# Production Readiness Check for WiseTale

echo "🔍 WiseTale Production Readiness Check"
echo "======================================"
echo ""

# Initialize counters
WARNINGS=0
ERRORS=0

# Check for .env files
echo "📄 Checking environment files..."
if [ ! -f "wizetale-api/.env" ]; then
    echo "❌ ERROR: wizetale-api/.env not found!"
    ((ERRORS++))
else
    echo "✅ Backend .env found"
fi

if [ ! -f "wizetale-app/.env" ]; then
    echo "⚠️  WARNING: wizetale-app/.env not found (will use Vercel env vars)"
    ((WARNINGS++))
else
    echo "✅ Frontend .env found"
fi

# Check for required API keys in backend .env
echo ""
echo "🔑 Checking API keys in backend..."
if [ -f "wizetale-api/.env" ]; then
    REQUIRED_KEYS=(
        "AZURE_OPENAI_API_KEY"
        "AZURE_SPEECH_KEY"
        "FIREBASE_STORAGE_BUCKET"
        "API_KEY"
    )
    
    for key in "${REQUIRED_KEYS[@]}"; do
        if grep -q "^$key=" "wizetale-api/.env"; then
            echo "✅ $key is set"
        else
            echo "❌ ERROR: $key is missing!"
            ((ERRORS++))
        fi
    done
fi

# Check CORS configuration
echo ""
echo "🔒 Checking security configuration..."
if grep -q 'origins = \["*"\]' "wizetale-api/app/main.py"; then
    echo "⚠️  WARNING: CORS is set to allow all origins (development mode)"
    echo "   Make sure to update this for production!"
    ((WARNINGS++))
else
    echo "✅ CORS appears to be configured properly"
fi

# Check Docker installation
echo ""
echo "🐳 Checking Docker..."
if command -v docker &> /dev/null; then
    echo "✅ Docker is installed"
    docker --version
else
    echo "❌ ERROR: Docker is not installed!"
    ((ERRORS++))
fi

if command -v docker-compose &> /dev/null; then
    echo "✅ Docker Compose is installed"
    docker-compose --version
else
    echo "❌ ERROR: Docker Compose is not installed!"
    ((ERRORS++))
fi

# Check if production docker-compose exists
echo ""
echo "📦 Checking production configuration..."
if [ -f "docker-compose.prod.yml" ]; then
    echo "✅ Production docker-compose found"
else
    echo "❌ ERROR: docker-compose.prod.yml not found!"
    ((ERRORS++))
fi

# Check nginx configuration
if [ -f "nginx.conf" ]; then
    echo "✅ Nginx configuration found"
    if grep -q "listen 443 ssl" "nginx.conf"; then
        echo "⚠️  WARNING: HTTPS configuration is commented out"
        echo "   You'll need SSL certificates for production"
        ((WARNINGS++))
    fi
else
    echo "❌ ERROR: nginx.conf not found!"
    ((ERRORS++))
fi

# Summary
echo ""
echo "======================================"
echo "📊 SUMMARY"
echo "======================================"
echo "Errors: $ERRORS"
echo "Warnings: $WARNINGS"
echo ""

if [ $ERRORS -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        echo "✅ Your project appears ready for production!"
    else
        echo "⚠️  Your project has some warnings but can be deployed."
        echo "   Review the warnings above before deploying."
    fi
else
    echo "❌ Your project has critical errors that must be fixed before production!"
    echo "   Review the errors above and fix them."
fi

echo ""
echo "📚 Next steps:"
echo "1. Fix any errors shown above"
echo "2. Set up your domain DNS"
echo "3. Get SSL certificates"
echo "4. Deploy to your servers"
echo "5. Test everything thoroughly"
echo ""
echo "Good luck with your deployment! 🚀" 