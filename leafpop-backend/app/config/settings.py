"""
Application settings, loaded from environment variables / .env file.
"""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # --- Supabase ---
    supabase_url: str = ""
    supabase_key: str = ""          # anon/public key (safe for read-mostly ops)
    supabase_service_key: str = ""  # service-role key, server-side only, never exposed

    # --- Gemini AI ---
    gemini_api_key: str = ""

    # --- Storage buckets ---
    supabase_storage_leaf_bucket: str = "leaf-images"
    supabase_storage_audio_bucket: str = "pop-audio"

    # --- Upload limits ---
    max_image_size_mb: int = 10
    max_audio_size_mb: int = 20
    min_audio_duration_sec: float = 0.5
    max_audio_duration_sec: float = 30.0

    # --- Anti-cheat ---
    max_pop_attempts_per_minute: int = 6
    max_upload_requests_per_minute: int = 10

    # --- App ---
    environment: str = "development"
    app_name: str = "leafpop-backend"
    app_version: str = "1.0.0"
    log_level: str = "INFO"

    # --- CORS ---
    cors_allow_origins: str = "*"  # comma-separated list in prod

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def is_supabase_configured(self) -> bool:
        return bool(self.supabase_url and (self.supabase_key or self.supabase_service_key))

    @property
    def cors_origins_list(self) -> list[str]:
        if self.cors_allow_origins == "*":
            return ["*"]
        return [o.strip() for o in self.cors_allow_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
