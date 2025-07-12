#!/bin/bash

# Script to generate secure secrets for production

echo "🔐 Generating secure secrets for WiseTale production..."
echo ""

# Generate API Key
API_KEY=$(openssl rand -hex 32)
echo "API_KEY=$API_KEY"
echo ""

# Generate JWT Secret
JWT_SECRET=$(openssl rand -hex 64)
echo "JWT_SECRET_KEY=$JWT_SECRET"
echo ""

# Generate general secret key
SECRET_KEY=$(openssl rand -hex 32)
echo "SECRET_KEY=$SECRET_KEY"
echo ""

echo "⚠️  Copy these values to your .env file and keep them secure!"
echo "⚠️  Never commit these values to git!" 