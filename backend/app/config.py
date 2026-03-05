from pydantic_settings import BaseSettings
from pydantic import field_validator
from functools import lru_cache
import os


def _get_secure_secret_key() -> str:
    """Generate or retrieve secure SECRET_KEY from environment."""
    from_env = os.getenv('SECRET_KEY')
    if from_env and from_env != 'change-me-in-production-use-openssl-rand-hex-32':
        return from_env
    
    # Fallback for development (UNSAFE - always set SECRET_KEY in production)
    env = os.getenv('ENVIRONMENT', 'development')
    if env == 'production':
        raise ValueError('SECRET_KEY must be set in production environment via .env file')
    
    return 'dev-insecure-key-change-in-production'


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
    SECRET_KEY: str = _get_secure_secret_key()
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # ── Account Security ────────────────────────────────────────────────–
    MAX_LOGIN_ATTEMPTS: int = 5
    ACCOUNT_LOCKOUT_DURATION_MINUTES: int = 15

    # ── Rate Limiting ───────────────────────────────────────────────────–
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_REQUESTS_PER_MINUTE: int = 60  # Global rate limit
    RATE_LIMIT_AUTH_REQUESTS_PER_MINUTE: int = 10  # Auth endpoints (login, register)

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

    # ── OpenRouter LLM (Fallback AI) ──────────────────────────────────────
    OPENROUTER_API_KEY: str = "sk-or-v1-placeholder"
    OPENROUTER_MODEL: str = "openrouter/auto"  # or specific model like "anthropic/claude-3-5-sonnet"
    LLM_CONFIDENCE_THRESHOLD: float = 0.65  # Use fallback if ML confidence < threshold
    LLM_TIMEOUT: int = 30  # seconds

    # ── ML Model Configuration ────────────────────────────────────────────
    ML_MODEL_TIMEOUT: int = 10  # seconds for local ML inference
    GPU_ENABLED: bool = False  # Set True if GPU available

    # ── Email / MailBluster ──────────────────────────────────────────────
    MAILBLUSTER_API_KEY: str = ""
    EMAIL_FROM_ADDRESS: str = "noreply@chikitsak.ai"
    EMAIL_FROM_NAME: str = "Chikitsak AI"
    FRONTEND_URL: str = "http://localhost:3000"  # For password reset links
    PASSWORD_RESET_TOKEN_EXPIRE_HOURS: int = 1
    
    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
    }


@lru_cache()
def get_settings() -> Settings:
    """Cached settings singleton."""
    return Settings()


# Property aliases for convenience
settings = get_settings()

# Map snake_case properties for email_service compatibility
setattr(Settings, 'mailbluster_api_key', property(lambda self: self.MAILBLUSTER_API_KEY))
setattr(Settings, 'email_from_address', property(lambda self: self.EMAIL_FROM_ADDRESS))
setattr(Settings, 'email_from_name', property(lambda self: self.EMAIL_FROM_NAME))
