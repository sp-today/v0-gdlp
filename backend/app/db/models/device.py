from sqlalchemy import Column, String, Date, Numeric, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime

from app.db.base import Base
from app.models.device import WarrantyType

class Device(Base):
    __tablename__ = "devices"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    device_name = Column(String, nullable=False)
    device_type = Column(String, nullable=False)
    brand = Column(String, nullable=False)
    model = Column(String, nullable=False)
    serial_number = Column(String, unique=True)
    imei_number = Column(String)
    purchase_date = Column(Date, nullable=False)
    purchase_price = Column(Numeric(10, 2))
    warranty_start_date = Column(Date)
    warranty_end_date = Column(Date)
    warranty_type = Column(Enum(WarrantyType))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)