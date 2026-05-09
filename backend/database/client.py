from functools import lru_cache
from supabase import create_client, Client
from config import get_settings


@lru_cache()    
def get_supabase() -> Client:
    """
    Returns the authenticated Supabase client.
    Cached — only created once for the lifetime of the app.
    """
    settings = get_settings()
    return create_client(settings.supabase_url, settings.supabase_key)