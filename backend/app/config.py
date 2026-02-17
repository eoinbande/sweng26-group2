"""
Configuration settings for the Goal Tracker backend.

Manages environment variables and application settings.
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Settings:
    """Application settings loaded from environment variables."""
    
    # Supabase configuration
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    
    # Application settings
    APP_NAME: str = "Goal Tracker API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # Testing flag - set to True when running tests
    TESTING: bool = os.getenv("TESTING", "False").lower() == "true"
    
    # CORS settings
    CORS_ORIGINS: list = [
        "http://localhost:3000",  # React dev server
        "http://localhost:5173",  # Vite dev server
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]
    
    # Add production origins from environment if available
    if prod_origins := os.getenv("CORS_ORIGINS"):
        CORS_ORIGINS.extend(prod_origins.split(","))
    
    @classmethod
    def validate(cls) -> None:
        """
        Validate that required environment variables are set.
        Skips validation in test mode.
        """
        if cls.TESTING:
            # In test mode, don't require real credentials
            return
            
        if not cls.SUPABASE_URL:
            raise ValueError("SUPABASE_URL environment variable is required")
        if not cls.SUPABASE_KEY:
            raise ValueError("SUPABASE_KEY environment variable is required")


# Create settings instance
settings = Settings()