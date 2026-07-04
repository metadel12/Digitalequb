from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, validator, root_validator
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
    OTP_LENGTH: int = 6
    
    # Database
    DATABASE_URL: Optional[str] = None
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 10
    MONGODB_URI: Optional[str] = "mongodb+srv://metadel:abebe1beso-bela@kaloss-coffee.hrr2n6e.mongodb.net/digiequb?retryWrites=true&w=majority"
    MONGODB_DB_NAME: str = "digiequb"
    MONGODB_USERS_COLLECTION: str = "users"
    
    # Blockchain
    WEB3_PROVIDER_URL: Optional[str] = "https://sepolia.infura.io/v3/YOUR_INFURA_KEY"
    CONTRACT_ADDRESS: Optional[str] = None
    ADMIN_WALLET_PRIVATE_KEY: Optional[str] = None
    BLOCKCHAIN_NETWORK: str = "sepolia"
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://localhost:4173",
        "http://127.0.0.1:3000",
    ]
    ALLOWED_HOSTS: List[str] = ["localhost", "127.0.0.1"]
    
    # Email - Gmail API Configuration (OAuth2)
    GMAIL_CLIENT_ID: Optional[str] = None
    GMAIL_CLIENT_SECRET: Optional[str] = None
    GMAIL_REFRESH_TOKEN: Optional[str] = None
    GMAIL_SERVICE_ACCOUNT_JSON: Optional[str] = None
    GMAIL_SENDER_EMAIL: Optional[str] = None
    EMAIL_FROM: Optional[str] = None
    FROM_EMAIL: str = "noreply@digiequb.com"
    FROM_NAME: str = "DigiEqub"

    @root_validator(pre=True)
    def alias_email_from(cls, values):
        if not values.get("FROM_EMAIL") and values.get("EMAIL_FROM"):
            values["FROM_EMAIL"] = values["EMAIL_FROM"]
        return values
    
    # Email - SMTP (Optional - kept for backward compatibility)
    SENDGRID_API_KEY: Optional[str] = None
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_TIMEOUT: int = 10
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    
    # SMS
    TWILIO_ACCOUNT_SID: Optional[str] = None
    TWILIO_AUTH_TOKEN: Optional[str] = None
    TWILIO_PHONE_NUMBER: Optional[str] = None
    AFRICASTALKING_USERNAME: Optional[str] = "sandbox"
    AFRICASTALKING_API_KEY: Optional[str] = None
    AFRICASTALKING_SENDER: str = "DigiEqub"
    AFRICASTALKING_BASE_URL: Optional[str] = None
    TEST_SMS_TO: Optional[str] = None
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"
    
    # AWS
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_STORAGE_BUCKET_NAME: Optional[str] = None
    AWS_REGION: str = "us-east-1"
    
    # Frontend
    FRONTEND_URL: str = "http://localhost:5173"

    # Supabase
    SUPABASE_URL: Optional[str] = None
    SUPABASE_KEY: Optional[str] = None
    SUPABASE_DOCUMENTS_BUCKET: str = "digiequb"
    MAX_FILE_SIZE_MB: int = 25
    
    # OAuth
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    GOOGLE_REDIRECT_URI: Optional[str] = None
    APPLE_CLIENT_ID: Optional[str] = None
    APPLE_TEAM_ID: Optional[str] = None
    APPLE_KEY_ID: Optional[str] = None
    APPLE_PRIVATE_KEY: Optional[str] = None
    APPLE_REDIRECT_URI: Optional[str] = None
    
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
        extra = "ignore"

settings = Settings()