import base64
import hashlib
import hmac
import secrets
from datetime import datetime, timedelta
from typing import Optional

from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

from app.core.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

PBKDF2_ITERATIONS = 390000
PBKDF2_ALGORITHM = "sha256"
PASSWORD_SCHEME = "pbkdf2_sha256"


def _get_jwt_secret_key() -> str:
    return getattr(settings, "JWT_SECRET_KEY", None) or getattr(settings, "SECRET_KEY")


def _get_jwt_algorithm() -> str:
    return getattr(settings, "JWT_ALGORITHM", None) or getattr(settings, "ALGORITHM", "HS256")


def _get_access_expiry_minutes() -> int:
    return int(
        getattr(settings, "JWT_ACCESS_TOKEN_EXPIRE_MINUTES", None)
        or getattr(settings, "ACCESS_TOKEN_EXPIRE_MINUTES", 30)
    )


def _get_refresh_expiry_days() -> int:
    return int(
        getattr(settings, "JWT_REFRESH_TOKEN_EXPIRE_DAYS", None)
        or getattr(settings, "REFRESH_TOKEN_EXPIRE_DAYS", 7)
    )


def _b64encode(value: bytes) -> str:
    return base64.b64encode(value).decode("utf-8")


def _b64decode(value: str) -> bytes:
    return base64.b64decode(value.encode("utf-8"))


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        scheme, iterations, salt, digest = hashed_password.split("$", 3)
        if scheme != PASSWORD_SCHEME:
            return False
        calculated = hashlib.pbkdf2_hmac(
            PBKDF2_ALGORITHM,
            plain_password.encode("utf-8"),
            _b64decode(salt),
            int(iterations),
        )
        return hmac.compare_digest(_b64encode(calculated), digest)
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac(
        PBKDF2_ALGORITHM,
        password.encode("utf-8"),
        salt,
        PBKDF2_ITERATIONS,
    )
    return f"{PASSWORD_SCHEME}${PBKDF2_ITERATIONS}${_b64encode(salt)}${_b64encode(digest)}"


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=_get_access_expiry_minutes())
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, _get_jwt_secret_key(), algorithm=_get_jwt_algorithm())
    return encoded_jwt


def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=_get_refresh_expiry_days())
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, _get_jwt_secret_key(), algorithm=_get_jwt_algorithm())
    return encoded_jwt


def create_verification_token(data: dict | str, expires_delta: Optional[timedelta] = None):
    payload = data if isinstance(data, dict) else {"sub": data}
    to_encode = payload.copy()
    expire = datetime.utcnow() + (
        expires_delta if expires_delta else timedelta(hours=24)
    )
    to_encode.update({"exp": expire, "type": "verification"})
    return jwt.encode(to_encode, _get_jwt_secret_key(), algorithm=_get_jwt_algorithm())


def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, _get_jwt_secret_key(), algorithms=[_get_jwt_algorithm()])
        return payload
    except JWTError:
        return None


def decode_refresh_token(token: str):
    try:
        payload = jwt.decode(token, _get_jwt_secret_key(), algorithms=[_get_jwt_algorithm()])
        return payload
    except JWTError:
        return None


def verify_token(token: str):
    return decode_access_token(token) or decode_refresh_token(token)
