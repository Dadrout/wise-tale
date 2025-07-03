# Multi-stage build for faster rebuilds and production optimization
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

# Build stage
FROM base as builder
WORKDIR /app

# Copy package files and install all dependencies
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM base as production
WORKDIR /app

# Add non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application from builder stage
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/api/health || exit 1

CMD ["node", "server.js"] 