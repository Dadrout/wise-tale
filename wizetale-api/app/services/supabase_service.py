"""
Supabase Service Utility
Usage:
    from app.services.supabase_service import get_supabase_client
    supabase = get_supabase_client()
"""
import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

def get_supabase_client() -> Client:
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise RuntimeError("Supabase credentials are not set in environment variables.")
    return create_client(SUPABASE_URL, SUPABASE_KEY) 