# This file is the new entrypoint for the Celery worker.
# It ensures that the task modules are discovered correctly.

import logging
import os
import firebase_admin
from firebase_admin import credentials
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

# Initialize Firebase Admin SDK
try:
    cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS_PATH")
    bucket_name = os.getenv("FIREBASE_STORAGE_BUCKET")
    
    if cred_path and bucket_name:
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred, {'storageBucket': bucket_name})
        logging.info("✅ Firebase Admin SDK initialized successfully in Celery worker.")
    else:
        logging.warning("⚠️ Firebase credentials not found. Firebase services will be disabled.")
except Exception as e:
    logging.error(f"❌ Failed to initialize Firebase Admin SDK in Celery worker: {e}", exc_info=True)

from app.celery_utils import celery_app

# Add the tasks module to the includes
celery_app.conf.include = [
    'app.api.v1.generate'
] 