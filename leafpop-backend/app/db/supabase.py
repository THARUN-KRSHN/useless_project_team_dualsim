"""
Supabase client wrapper.

Uses the service-role key when available (server-side trusted context) so the
backend can write to protected tables and storage buckets regardless of RLS
policies written for end-user clients. Falls back to the anon key for local
dev/testing against a permissive project.
"""
from functools import lru_cache

from supabase import create_client, Client

from app.config.settings import get_settings
from app.utils.errors import DatabaseError

settings = get_settings()


@lru_cache
def get_supabase() -> Client:
    if not settings.is_supabase_configured:
        raise DatabaseError(
            "Supabase is not configured. Set SUPABASE_URL and SUPABASE_KEY "
            "(or SUPABASE_SERVICE_KEY) in your environment."
        )
    key = settings.supabase_service_key or settings.supabase_key
    return create_client(settings.supabase_url, key)
