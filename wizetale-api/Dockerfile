# Multi-stage build for maximum optimization
# --- Base Stage ---
FROM python:3.11 AS base

# Install system dependencies that might be needed by Python packages
RUN --mount=type=cache,target=/var/cache/apt \
    --mount=type=cache,target=/var/lib/apt \
    apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libass9 libfreetype6 fonts-dejavu-core \
    && rm -rf /var/lib/apt/lists/*

# Install uv for faster dependency management
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install uv

# Set workdir and copy dependency files
WORKDIR /app
COPY pyproject.toml poetry.lock* ./

# Install dependencies in a virtual environment
RUN uv venv .venv && \
    . .venv/bin/activate && \
    uv pip install -r pyproject.toml

# --- Development Stage ---
FROM base AS dev
WORKDIR /app

# Copy the rest of the application code
COPY . .

# No extra install needed; deps already in .venv
CMD [".venv/bin/uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

# --- Production Stage ---
FROM base AS prod
WORKDIR /app
COPY --from=dev /app .

# No CMD here, will be provided by docker-compose