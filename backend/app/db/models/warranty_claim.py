from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Enum, Numeric
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime

from app.db.base import Base
from app.models.warranty_claim import ClaimType, ClaimStatus

class WarrantyClaim(Base):
    __tablename__ = "warranty_claims"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    device_id = Column(UUID(as_uuid=True), ForeignKey("devices.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    claim_type = Column(Enum(ClaimType), nullable=False)
    issue_description = Column(Text, nullable=False)
    claim_status = Column(
        Enum(ClaimStatus),
        nullable=False,
        default=ClaimStatus.SUBMITTED
    )
    claim_amount = Column(Numeric(10, 2))
    submitted_date = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    resolution_date = Column(DateTime(timezone=True))
    rejection_reason = Column(Text)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)