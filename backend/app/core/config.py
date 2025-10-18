from typing import Any, List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import AnyHttpUrl, field_validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "GDLP Backend"
    API_V1_STR: str = "/api/v1"
    VERSION: str = "1.0.0"
    
    DATABASE_URL: str
    REDIS_URL: str = "redis://redis:6379/0"
    SUPABASE_URL: str
    SUPABASE_SERVICE_KEY: str
    
    # File storage
    WARRANTY_DOCS_PATH: str = "/app/storage/warranty-docs"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",  # Next.js frontend
        "http://localhost:8000",  # FastAPI Swagger UI
    ]
    
    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    def validate_cors_origins(cls, v: List[str] | str) -> List[str]:
        if isinstance(v, str):
            # Handle comma-separated strings from environment variables
            return [origin.strip() for origin in v.split(",")]
        return v
    
    model_config = SettingsConfigDict(
        case_sensitive=True,
        env_file=".env",
        validate_default=True
    )

settings = Settings()