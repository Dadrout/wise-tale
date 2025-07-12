#!/bin/bash

# Commands to run on Digital Ocean server (138.197.191.222)
# Copy and paste these commands one by one

echo "🌊 WiseTale Server Deployment Commands"
echo "======================================"
echo "IP: 138.197.191.222"
echo ""

echo "1. Update system:"
echo "apt update && apt upgrade -y"
echo ""

echo "2. Install Docker:"
echo "curl -fsSL https://get.docker.com -o get-docker.sh"
echo "sh get-docker.sh"
echo ""

echo "3. Install Docker Compose:"
echo "apt install docker-compose -y"
echo ""

echo "4. Clone repository (replace your-username with your GitHub username):"
echo "git clone https://github.com/your-username/WiseTale.git"
echo "cd WiseTale"
echo ""

echo "5. Deploy:"
echo "./deploy.sh"
echo ""

echo "6. Check status:"
echo "./manage-prod.sh status"
echo ""

echo "7. Monitor logs:"
echo "./manage-prod.sh logs"
echo ""

echo "🔒 After DNS setup, get SSL certificate:"
echo "apt install certbot python3-certbot-nginx -y"
echo "certbot --nginx -d api.wizetale.com"
echo ""

echo "✅ Backend will be available at:"
echo "https://api.wizetale.com"
echo "" 