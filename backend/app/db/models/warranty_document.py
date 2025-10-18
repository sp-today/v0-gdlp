from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Enum
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime

from app.db.base import Base
from app.models.warranty_document import DocumentStatus, DocumentType

class WarrantyDocument(Base):
    __tablename__ = "warranty_documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    device_id = Column(UUID(as_uuid=True), ForeignKey("devices.id", ondelete="CASCADE"), nullable=False)
    document_type = Column(Enum(DocumentType), nullable=False)
    document_url = Column(String, nullable=False)
    ocr_extracted_text = Column(Text)
    document_status = Column(
        Enum(DocumentStatus),
        nullable=False,
        default=DocumentStatus.PENDING
    )
    uploaded_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)