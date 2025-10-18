from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, UUID4

class DocumentType(str, Enum):
    INVOICE = "invoice"
    WARRANTY_CARD = "warranty_card"
    RECEIPT = "receipt"
    CERTIFICATE = "certificate"

class DocumentStatus(str, Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"

class WarrantyDocumentBase(BaseModel):
    device_id: UUID4
    document_type: DocumentType
    document_status: DocumentStatus = DocumentStatus.PENDING

class WarrantyDocumentCreate(WarrantyDocumentBase):
    pass

class WarrantyDocumentDB(WarrantyDocumentBase):
    id: UUID4
    document_url: str
    ocr_extracted_text: Optional[str] = None
    uploaded_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True

class WarrantyDocumentResponse(WarrantyDocumentDB):
    pass