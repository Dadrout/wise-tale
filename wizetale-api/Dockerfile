FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Set workdir
WORKDIR /app

# Copy dependency files and install them
COPY pyproject.toml ./
RUN pip install --no-cache-dir gunicorn uvicorn
RUN pip install --no-cache-dir .

# Copy the rest of the application
COPY app ./app
COPY worker.py ./
COPY gunicorn.conf.py .
COPY time-capsule-d5a66-c542dacf194a.json /app/time-capsule-d5a66-c542dacf194a.json

# Expose port and run
EXPOSE 8000

# Use optimized gunicorn configuration for production
# Calculate workers based on CPU cores for better performance
CMD ["gunicorn", "-c", "gunicorn.conf.py", "app.main:app"]