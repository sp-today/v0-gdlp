from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class BaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class TimestampedSchema(BaseSchema):
    created_at: datetime
    updated_at: Optional[datetime] = None