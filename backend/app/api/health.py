from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.cache import RedisCache

router = APIRouter()

@router.get("/health")
async def health_check(
    db: AsyncSession = Depends(get_db),
    cache: RedisCache = Depends()
):
    """Health check endpoint that verifies database and cache connections."""
    status = {
        "status": "healthy",
        "details": {
            "database": "healthy",
            "cache": "healthy"
        }
    }
    
    try:
        # Check database connection
        await db.execute("SELECT 1")
    except Exception as e:
        status["status"] = "unhealthy"
        status["details"]["database"] = f"unhealthy: {str(e)}"
    
    try:
        # Check Redis connection
        await cache.ping()
    except Exception as e:
        status["status"] = "unhealthy"
        status["details"]["cache"] = f"unhealthy: {str(e)}"
    
    return status