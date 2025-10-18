from datetime import date, datetime
from decimal import Decimal
from enum import Enum
from typing import Optional
from pydantic import BaseModel, UUID4

class WarrantyType(str, Enum):
    MANUFACTURER = "manufacturer"
    EXTENDED = "extended"
    THIRD_PARTY = "third_party"

class DeviceBase(BaseModel):
    device_name: str
    device_type: str
    brand: str
    model: str
    serial_number: Optional[str] = None
    imei_number: Optional[str] = None
    purchase_date: date
    purchase_price: Optional[Decimal] = None
    warranty_start_date: Optional[date] = None
    warranty_end_date: Optional[date] = None
    warranty_type: Optional[WarrantyType] = None
    is_active: bool = True

class DeviceCreate(DeviceBase):
    pass

class DeviceUpdate(DeviceBase):
    device_name: Optional[str] = None
    device_type: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    purchase_date: Optional[date] = None

class DeviceDB(DeviceBase):
    id: UUID4
    user_id: UUID4
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DeviceResponse(DeviceDB):
    pass