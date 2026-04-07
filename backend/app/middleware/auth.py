from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.security import decode_access_token

security = HTTPBearer()

async def get_current_user_from_token(token: str):
    """Extract user from JWT token"""
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload

async def auth_middleware(request: Request):
    """Middleware to check authentication"""
    try:
        credentials: HTTPAuthorizationCredentials = await security(request)
        token = credentials.credentials
        user = await get_current_user_from_token(token)
        request.state.user = user
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )