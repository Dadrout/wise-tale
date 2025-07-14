import os

# Server socket
bind = "0.0.0.0:8000"

# Worker processes
cpu_count = os.cpu_count()
workers = cpu_count * 2 + 1 if cpu_count else 2
worker_class = "uvicorn.workers.UvicornWorker"

# Logging
loglevel = "info"
accesslog = "-"
errorlog = "-"

# Process naming
proc_name = "wizetale-api" 