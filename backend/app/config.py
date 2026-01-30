from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Application settings."""
    
    SUPABASE_URL: str
    SUPABASE_KEY: str
    TEST_USER_ID: str
    ENVIRONMENT: str = "development"
    
    class Config:
        env_file = ".env"

settings = Settings()