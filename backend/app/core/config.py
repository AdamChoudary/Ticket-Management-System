"""
Configuration management for the AI Support Hub backend.

Uses Pydantic Settings for type-safe environment variable loading with validation.
"""

from typing import List
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Database Configuration
    postgres_user: str = Field(default="postgres", description="PostgreSQL username")
    postgres_password: str = Field(default="postgres", description="PostgreSQL password")
    postgres_db: str = Field(default="tickets", description="Database name")
    postgres_host: str = Field(default="localhost", description="Database host")
    postgres_port: int = Field(default=5432, description="Database port")
    
    # Redis Configuration
    redis_host: str = Field(default="localhost", description="Redis host")
    redis_port: int = Field(default=6379, description="Redis port")
    
    # API Configuration
    api_title: str = Field(default="AI Support Hub API", description="API title")
    api_version: str = Field(default="1.0.0", description="API version")
    debug: bool = Field(default=True, description="Debug mode")
    allowed_origins: str = Field(
        default="http://localhost:3000",
        description="Comma-separated list of allowed CORS origins"
    )
    
    # Celery Configuration
    celery_broker_url: str = Field(default="", description="Celery broker URL (auto-computed if empty)")
    celery_result_backend: str = Field(default="", description="Celery result backend (auto-computed if empty)")
    
    # AI Configuration
    openai_api_key: str = Field(default="", description="OpenAI API Key (optional)")
    openai_model: str = Field(default="gpt-4-turbo-preview", description="OpenAI Model ID")
    
    gemini_api_key: str = Field(default="", description="Google Gemini API Key (optional)")
    gemini_model: str = Field(default="gemini-1.5-flash", description="Google Gemini Model ID")
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )
    
    @property
    def database_url(self) -> str:
        """Construct async database URL for SQLAlchemy."""
        return (
            f"postgresql+asyncpg://{self.postgres_user}:{self.postgres_password}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )
    
    @property
    def database_url_sync(self) -> str:
        """Construct sync database URL for Alembic migrations."""
        return (
            f"postgresql://{self.postgres_user}:{self.postgres_password}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )
    
    @property
    def redis_url(self) -> str:
        """Construct Redis URL."""
        return f"redis://{self.redis_host}:{self.redis_port}/0"
    
    @property
    def cors_origins(self) -> List[str]:
        """Parse allowed origins from comma-separated string."""
        return [origin.strip() for origin in self.allowed_origins.split(",")]
    
    def get_celery_broker_url(self) -> str:
        """Get Celery broker URL (use redis_url if not explicitly set)."""
        return self.celery_broker_url or self.redis_url
    
    def get_celery_result_backend(self) -> str:
        """Get Celery result backend URL (use redis_url if not explicitly set)."""
        return self.celery_result_backend or self.redis_url


# Global settings instance
settings = Settings()
