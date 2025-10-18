from typing import Optional, Any
import json
from redis.asyncio import Redis, from_url
from fastapi import Depends
from app.core.config import settings

# Create Redis connection
redis = from_url(settings.REDIS_URL, encoding="utf-8", decode_responses=True)

async def get_redis() -> Redis:
    try:
        await redis.ping()
        yield redis
    finally:
        await redis.close()

class RedisCache:
    def __init__(self, redis: Redis = Depends(get_redis)):
        self.redis = redis
    
    async def get(self, key: str) -> Optional[Any]:
        """Get a value from Redis cache"""
        value = await self.redis.get(key)
        if value:
            try:
                return json.loads(value)
            except json.JSONDecodeError:
                return value
        return None
    
    async def set(
        self, 
        key: str, 
        value: Any, 
        expire_seconds: Optional[int] = None
    ) -> None:
        """Set a value in Redis cache with optional expiration"""
        if not isinstance(value, str):
            value = json.dumps(value)
            
        if expire_seconds:
            await self.redis.setex(key, expire_seconds, value)
        else:
            await self.redis.set(key, value)
    
    async def delete(self, key: str) -> None:
        """Delete a value from Redis cache"""
        await self.redis.delete(key)
    
    async def exists(self, key: str) -> bool:
        """Check if a key exists in Redis cache"""
        return await self.redis.exists(key) > 0
        
    async def clear_pattern(self, pattern: str) -> None:
        """Clear all cache keys matching a pattern"""
        keys = await self.redis.keys(pattern)
        if keys:
            await self.redis.delete(*keys)