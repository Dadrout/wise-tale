import firebase_admin
from firebase_admin import credentials, storage, auth, firestore
import os
import asyncio
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

class FirebaseService:
    def __init__(self):
        if not firebase_admin._apps:
            try:
                creds_path = settings.GOOGLE_APPLICATION_CREDENTIALS_PATH
                bucket_name = settings.FIREBASE_STORAGE_BUCKET
                logger.info(f"🔥 Initializing Firebase with bucket: {bucket_name}")
                if creds_path and bucket_name:
                    if os.path.exists(creds_path):
                        cred = credentials.Certificate(creds_path)
                        firebase_admin.initialize_app(cred, {
                            'storageBucket': bucket_name.replace("gs://", "")
                        })
                        logger.info("✅ Firebase Admin initialized successfully.")
                    else:
                        logger.warning(f"⚠️  Firebase Admin not initialized: Credentials file not found at {creds_path}")
                else:
                    logger.warning("⚠️  Firebase Admin not initialized: GOOGLE_APPLICATION_CREDENTIALS_PATH or FIREBASE_STORAGE_BUCKET not set.")
            except Exception as e:
                logger.error(f"❌ Failed to initialize Firebase Admin: {e}", exc_info=True)
        
        self.db = firestore.client()
    
    def verify_id_token(self, id_token: str) -> dict:
        """Verifies the ID token and returns the decoded token."""
        if not firebase_admin._apps:
            msg = "Cannot verify token, Firebase not initialized."
            logger.error(f"❌ {msg}")
            raise ConnectionError(msg)
        try:
            decoded_token = auth.verify_id_token(id_token)
            return decoded_token
        except auth.InvalidIdTokenError:
            logger.warning("Invalid ID token.")
            raise ValueError("Invalid ID token")
        except Exception as e:
            logger.error(f"❌ Token verification failed: {e}", exc_info=True)
            raise

    async def save_story_to_firestore(self, user_id: str, story_data: dict):
        """Saves story generation details to Firestore."""
        if not self.db:
            msg = "Cannot save story, Firestore not initialized."
            logger.error(f"❌ {msg}")
            raise ConnectionError(msg)
        
        def _save_sync():
            try:
                # /users/{user_id}/stories/{story_id}
                user_stories_ref = self.db.collection('users').document(user_id).collection('stories')
                doc_ref = user_stories_ref.add(story_data)
                logger.info(f"✅ Story data saved to Firestore for user {user_id} with doc ID: {doc_ref[1].id}")
                return doc_ref[1].id
            except Exception as e:
                logger.error(f"❌ Failed to save story to Firestore: {e}", exc_info=True)
                raise
        
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, _save_sync)

    async def upload_file(self, source_file_path: str, destination_blob_name: str) -> str:
        """Uploads a file to the bucket asynchronously and returns its public URL."""

        def _upload_sync():
            if not firebase_admin._apps:
                msg = "Cannot upload file, Firebase not initialized."
                logger.error(f"❌ {msg}")
                raise ConnectionError(msg)
            
            try:
                # Get bucket without gs:// prefix. Name is optional if initialized.
                bucket = storage.bucket() 
                logger.info(f"✅ Got bucket: {bucket.name}")
                blob = bucket.blob(destination_blob_name)

                logger.info(f"📤 Uploading {source_file_path} to {destination_blob_name}...")
                blob.upload_from_filename(source_file_path)
                
                # Make the blob publicly viewable
                blob.make_public()

                logger.info(f"✅ File {source_file_path} uploaded to {destination_blob_name}.")
                return blob.public_url
            except Exception as e:
                logger.error(f"❌ File upload to Firebase failed: {e}", exc_info=True)
                raise # Re-raise the exception to be handled by the caller
        
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, _upload_sync)


firebase_service = FirebaseService() 