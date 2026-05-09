from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Supabase
    supabase_url: str
    supabase_key: str

    # Gmail
    gmail_user: str = ""
    gmail_pass: str = ""

    # Groq — optional for now
    groq_api_key: str = ""

    # OpenAI — optional for now, required in Phase 4
    openai_api_key: str = ""

    # App
    app_env: str = "development"
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    cors_origins: str = "http://localhost:3000"

    def get_cors_list(self) -> list[str]:
        """Split comma-separated CORS origins into a list."""
        return [o.strip() for o in self.cors_origins.split(",")]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,   # SUPABASE_URL and supabase_url are the same
        extra="ignore"         # Ignore env vars that aren't defined here
    )


# Singleton — env is read only once, cached forever
@lru_cache()
def get_settings() -> Settings:
    return Settings()