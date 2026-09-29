from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    FRONTEND_URL: str = "http://localhost:5173"
    
    FIREBASE_SERVICE_ACCOUNT_PATH: Optional[str] = "serviceAccountKey.json"
    FIREBASE_PROJECT_ID: Optional[str] = None
    FIREBASE_CLIENT_EMAIL: Optional[str] = None
    FIREBASE_PRIVATE_KEY: Optional[str] = None
    FIREBASE_STORAGE_BUCKET: Optional[str] = None
    USE_MOCK_FIREBASE: bool = False

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
