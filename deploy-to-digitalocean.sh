#!/bin/bash

# WiseTale Digital Ocean Deployment Script
# IP: 138.197.191.222

echo "🌊 WiseTale Digital Ocean Deployment"
echo "====================================="
echo "IP: 138.197.191.222"
echo ""

echo "📋 Commands to run on your Digital Ocean droplet:"
echo ""

echo "# 1. Connect to server"
echo "ssh root@138.197.191.222"
echo ""

echo "# 2. Update system"
echo "apt update && apt upgrade -y"
echo ""

echo "# 3. Install Docker"
echo "curl -fsSL https://get.docker.com -o get-docker.sh"
echo "sh get-docker.sh"
echo ""

echo "# 4. Install Docker Compose"
echo "apt install docker-compose -y"
echo ""

echo "# 5. Clone repository"
echo "git clone https://github.com/your-username/WiseTale.git"
echo "cd WiseTale"
echo ""

echo "# 6. Deploy"
echo "./deploy.sh"
echo ""

echo "# 7. Check status"
echo "./manage-prod.sh status"
echo ""

echo "# 8. Monitor logs"
echo "./manage-prod.sh logs"
echo ""

echo "🔒 SSL Certificate (after DNS setup):"
echo "apt install certbot python3-certbot-nginx -y"
echo "certbot --nginx -d api.wizetale.com"
echo ""

echo "🌐 DNS Configuration needed:"
echo "A record: api → 138.197.191.222"
echo ""

echo "✅ Backend will be available at:"
echo "https://api.wizetale.com"
echo "" 