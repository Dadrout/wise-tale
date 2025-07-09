# This file is the new entrypoint for the Celery worker.
# It ensures that the task modules are discovered correctly.
from app.celery_utils import celery_app

# Add the tasks module to the includes
celery_app.conf.include = [
    'app.api.v1.generate'
] 