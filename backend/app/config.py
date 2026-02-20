from pydantic_settings import BaseSettings
from pydantic import field_validator
from functools import lru_cache


class Settings(BaseSettings):
    """Application configuration loaded from environment variables / .env file."""

    # ── App ──────────────────────────────────────────────────────────────
    APP_NAME: str = "Chikitsak API"
    APP_DESCRIPTION: str = "AI Powered Personalized Health Operating System"
    APP_VERSION: str = "0.3.0"
    ENVIRONMENT: str = "development"  # development | staging | production
    DEBUG: bool = False

    # ── Database ─────────────────────────────────────────────────────────
    DATABASE_URL: str = "sqlite:///./chikitsak.db"

    # ── Auth / JWT ───────────────────────────────────────────────────────
    SECRET_KEY: str = "change-me-in-production-use-openssl-rand-hex-32"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── CORS ─────────────────────────────────────────────────────────────
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors(cls, v):
        """Accept both JSON list and comma-separated string from env."""
        if isinstance(v, str):
            import json
            try:
                parsed = json.loads(v)
                if isinstance(parsed, list):
                    return parsed
            except (json.JSONDecodeError, ValueError):
                pass
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    # ── Logging ──────────────────────────────────────────────────────────
    LOG_LEVEL: str = "INFO"

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
    }


@lru_cache()
def get_settings() -> Settings:
    """Cached settings singleton."""
    return Settings()
