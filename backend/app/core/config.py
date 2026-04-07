from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, validator
import secrets
import json

class Settings(BaseSettings):
    # API Configuration
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "DigiEqub"
    VERSION: str = "1.0.0"
    DEBUG: bool = False
    AUTO_CREATE_TABLES: bool = False
    
    @validator("DEBUG", "AUTO_CREATE_TABLES", pre=True)
    def parse_boolish(cls, v):
        if isinstance(v, bool):
            return v
        if isinstance(v, str):
            normalized = v.strip().lower()
            if normalized in {"true", "1", "yes", "on", "debug", "development"}:
                return True
            if normalized in {"false", "0", "no", "off", "release", "production"}:
                return False
        return v

    # Security
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    OTP_EXPIRY_MINUTES: int = 5
    
    # Database
    DATABASE_URL: str
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 10
    MONGODB_URI: str = "mongodb://127.0.0.1:27017"
    MONGODB_DB_NAME: str = "digiequb"
    MONGODB_USERS_COLLECTION: str = "users"
    
    # Blockchain
    WEB3_PROVIDER_URL: str
    CONTRACT_ADDRESS: Optional[str] = None
    ADMIN_WALLET_PRIVATE_KEY: str
    BLOCKCHAIN_NETWORK: str = "sepolia"
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]
    ALLOWED_HOSTS: List[str] = ["localhost", "127.0.0.1"]
    
    # Email
    SENDGRID_API_KEY: str
    FROM_EMAIL: str
    FROM_NAME: str = "DigiEqub"
    
    # SMS
    TWILIO_ACCOUNT_SID: str
    TWILIO_AUTH_TOKEN: str
    TWILIO_PHONE_NUMBER: str
    
    # Redis
    REDIS_URL: str
    CELERY_BROKER_URL: str
    CELERY_RESULT_BACKEND: str
    
    # AWS
    AWS_ACCESS_KEY_ID: str
    AWS_SECRET_ACCESS_KEY: str
    AWS_STORAGE_BUCKET_NAME: str
    AWS_REGION: str
    
    # Frontend
    FRONTEND_URL: str
    
    @validator("CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: str | List[str]) -> List[str]:
        if isinstance(v, str):
            normalized = v.strip()
            if normalized.startswith("["):
                try:
                    parsed = json.loads(normalized)
                    if isinstance(parsed, list):
                        return [str(item).strip() for item in parsed if str(item).strip()]
                except json.JSONDecodeError:
                    pass
            return [i.strip().strip('"').strip("'") for i in normalized.split(",") if i.strip()]
        return v
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
