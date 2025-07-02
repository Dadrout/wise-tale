# Multi-stage build for maximum optimization with BuildKit cache mounts
FROM python:3.11-slim AS base

# Install system dependencies with cache mount for faster rebuilds
RUN --mount=type=cache,target=/var/cache/apt \
    --mount=type=cache,target=/var/lib/apt \
    apt-get update && apt-get install -y \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Install uv with cache mount
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install uv

# Production dependencies stage
FROM base AS deps
WORKDIR /app

# Copy only dependency files first for better caching
COPY pyproject.toml uv.lock* ./

# Install dependencies with uv and cache mount for maximum speed
RUN --mount=type=cache,target=/root/.cache/uv \
    uv venv .venv && \
    . .venv/bin/activate && \
    uv sync --frozen --no-dev

# Development stage with all dependencies
FROM base AS dev
WORKDIR /app

# Copy dependency files
COPY pyproject.toml uv.lock* ./

# Install ALL dependencies including dev with cache mount
RUN --mount=type=cache,target=/root/.cache/uv \
    uv venv .venv && \
    . .venv/bin/activate && \
    uv sync --frozen

# Copy application code (this layer changes most often)
COPY . .

# Activate virtual environment for runtime
ENV VIRTUAL_ENV=/app/.venv
ENV PATH="/app/.venv/bin:$PATH"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# Production stage (smaller, optimized)
FROM deps AS prod
WORKDIR /app

# Copy only production code
COPY . .

# Activate virtual environment
ENV VIRTUAL_ENV=/app/.venv
ENV PATH="/app/.venv/bin:$PATH"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"] 