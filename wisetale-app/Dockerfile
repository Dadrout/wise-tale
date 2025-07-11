# Multi-stage build for maximum optimization

# --- Base Stage ---
# Start from a Node.js base image
FROM node:20-alpine AS base

# --- Deps Stage ---
# Install dependencies in a separate stage to leverage Docker's caching.
FROM base AS deps
WORKDIR /app

# Copy dependency definition files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci


# --- Development Stage ---
# This is the stage that runs when using docker-compose.dev.yml
FROM base AS dev
WORKDIR /app

# Copy dependency definition files
COPY package.json package-lock.json ./

# Install dependencies directly in the dev stage for reliability
RUN npm install

# Copy the rest of the app's source code
COPY . .

# Run the Next.js development server
CMD ["npm", "run", "dev"]


# --- Production Stage ---
# This stage builds the application for production.
FROM base AS builder
WORKDIR /app

# Copy installed dependencies and source code
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the Next.js application
RUN npm run build


# --- Final Production Stage ---
# This is the final, lean image for production.
FROM base as prod
WORKDIR /app

# Copy production-necessary files from the builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Start the Next.js production server
CMD ["npm", "start"] 