# Multi-stage build for faster rebuilds
FROM node:20-alpine as base

# Install dependencies only when needed
FROM base as deps
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production --legacy-peer-deps && npm cache clean --force

# Development stage
FROM base as dev
WORKDIR /app

# Copy package files and install all dependencies  
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

CMD ["npm", "run", "dev"] 