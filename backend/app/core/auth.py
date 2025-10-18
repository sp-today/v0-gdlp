import httpx
from typing import Dict, Any, Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.core.config import settings
from app.core.exceptions import UnauthorizedError

security = HTTPBearer()

async def validate_auth_token(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
) -> Dict[str, Any]:
    """
    Validate the JWT token using Supabase Auth service.
    This expects the Authorization header with a Bearer token.
    """
    try:
        # Call Supabase Auth API to get user
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.SUPABASE_URL}/auth/v1/user",
                headers={
                    "Authorization": f"Bearer {credentials.credentials}",
                    "apikey": settings.SUPABASE_SERVICE_KEY
                }
            )
            
            if response.status_code != 200:
                raise UnauthorizedError()
                
            user_data = response.json()
            return user_data
            
    except httpx.RequestError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service unavailable"
        )

async def get_current_user(
    user_data: Annotated[Dict[str, Any], Depends(validate_auth_token)]
) -> str:
    """Get the current authenticated user's ID from Supabase user data."""
    user_id = user_data.get("id")
    if not user_id:
        raise UnauthorizedError()
    return user_id