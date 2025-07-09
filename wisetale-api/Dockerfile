# Multi-stage build for maximum optimization
FROM python:3.11 AS base

# Install system dependencies that might be needed by Python packages
RUN --mount=type=cache,target=/var/cache/apt \
    --mount=type=cache,target=/var/lib/apt \
    apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Install uv for faster dependency management
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install uv

# --- Development Stage ---
FROM base AS dev
WORKDIR /app

# Copy dependency files
COPY pyproject.toml ./
COPY requirements.txt ./

# Install dependencies in a virtual environment
RUN uv venv .venv && \
    . .venv/bin/activate && \
    uv pip install -r requirements.txt

# Copy the rest of the application code
COPY . .

# Activate venv and run the app
CMD [".venv/bin/uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

# --- Production Stage ---
FROM base AS prod
WORKDIR /app

# Copy only necessary files from dev stage
COPY --from=dev /app/.venv ./.venv
COPY . .

# No CMD here, will be provided by docker-compose