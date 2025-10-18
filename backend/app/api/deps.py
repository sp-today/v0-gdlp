from typing import Annotated, Generator
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.auth import get_current_user
from app.core.cache import RedisCache

# Type annotations for common dependencies
DBSession = Annotated[AsyncSession, Depends(get_db)]
CurrentUser = Annotated[str, Depends(get_current_user)]
Cache = Annotated[RedisCache, Depends()]