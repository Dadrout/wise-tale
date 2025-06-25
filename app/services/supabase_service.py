from supabase import create_client, Client
from app.core.config import get_settings

settings = get_settings()

class SupabaseService:
    def __init__(self):
        self.client: Client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_KEY
        )
        
    async def get_user(self, user_id: str):
        """Get user by ID"""
        try:
            response = self.client.table('users').select('*').eq('id', user_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Supabase get user error: {e}")
            return None
            
    async def create_story(self, user_id: str, story_data: dict):
        """Create a new story"""
        try:
            story_data['user_id'] = user_id
            response = self.client.table('stories').insert(story_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Supabase create story error: {e}")
            return None
            
    async def get_story(self, story_id: str):
        """Get story by ID"""
        try:
            response = self.client.table('stories').select('*').eq('id', story_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Supabase get story error: {e}")
            return None

# Global Supabase instance
supabase_service = SupabaseService() 