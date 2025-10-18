from typing import Optional, Any
from pydantic import BaseModel

class ErrorResponse(BaseModel):
    detail: str
    code: Optional[str] = None
    metadata: Optional[dict[str, Any]] = None