#!/bin/bash

# WiseTale Production Deployment Script
# Replace YOUR_DROPLET_IP with your actual Digital Ocean droplet IP

echo "🚀 WiseTale Production Deployment"
echo "=================================="

# Configuration
DROPLET_IP="138.197.191.222"  # Digital Ocean droplet IP
DOMAIN="wizetale.com"

echo "📋 Configuration:"
echo "   Domain: $DOMAIN"
echo "   Backend IP: $DROPLET_IP"
echo ""

# Check if IP is set
if [ "$DROPLET_IP" = "YOUR_DROPLET_IP" ]; then
    echo "❌ ERROR: Please set your Digital Ocean droplet IP in this script"
    echo "   Edit DEPLOY_NOW.sh and replace YOUR_DROPLET_IP with your actual IP"
    exit 1
fi

echo "✅ Starting deployment..."

# 1. Deploy to Digital Ocean
echo ""
echo "🌊 Deploying to Digital Ocean..."
echo "   Run these commands on your droplet:"
echo ""
echo "   ssh root@$DROPLET_IP"
echo "   git clone https://github.com/your-username/WiseTale.git"
echo "   cd WiseTale"
echo "   ./deploy.sh"
echo ""

# 2. Deploy to Vercel
echo "⚡ Deploying to Vercel..."
echo "   Run these commands:"
echo ""
echo "   cd wizetale-app"
echo "   vercel --prod"
echo ""

# 3. DNS Configuration
echo "🌐 DNS Configuration needed:"
echo "   A record: @ → 76.76.21.21 (Vercel)"
echo "   CNAME: www → cname.vercel-dns.com (Vercel)"
echo "   A record: api → $DROPLET_IP (Digital Ocean)"
echo ""

# 4. SSL Certificate
echo "🔒 SSL Certificate needed:"
echo "   Run on your droplet:"
echo "   certbot --nginx -d api.$DOMAIN"
echo ""

echo "🎯 Deployment complete!"
echo "   Frontend: https://$DOMAIN"
echo "   Backend: https://api.$DOMAIN"
echo ""
echo "📚 Next steps:"
echo "   1. Set up DNS records"
echo "   2. Get SSL certificates"
echo "   3. Test the application"
echo "   4. Monitor logs: ./manage-prod.sh logs" 