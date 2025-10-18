from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Optional
from pydantic import BaseModel, UUID4

class ClaimType(str, Enum):
    REPAIR = "repair"
    REPLACEMENT = "replacement"
    REFUND = "refund"

class ClaimStatus(str, Enum):
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    COMPLETED = "completed"

class WarrantyClaimBase(BaseModel):
    device_id: UUID4
    claim_type: ClaimType
    issue_description: str
    claim_amount: Optional[Decimal] = None

class WarrantyClaimCreate(WarrantyClaimBase):
    pass

class WarrantyClaimUpdate(BaseModel):
    claim_type: Optional[ClaimType] = None
    issue_description: Optional[str] = None
    claim_amount: Optional[Decimal] = None
    claim_status: Optional[ClaimStatus] = None
    rejection_reason: Optional[str] = None

class WarrantyClaimDB(WarrantyClaimBase):
    id: UUID4
    user_id: UUID4
    claim_status: ClaimStatus = ClaimStatus.SUBMITTED
    submitted_date: datetime
    resolution_date: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class WarrantyClaimResponse(WarrantyClaimDB):
    pass

# Batch operations models
class BatchClaimCreate(BaseModel):
    claims: list[WarrantyClaimCreate]

class BatchClaimUpdate(BaseModel):
    claim_ids: list[UUID4]
    update: WarrantyClaimUpdate

class BatchClaimResponse(BaseModel):
    succeeded: list[WarrantyClaimResponse]
    failed: list[dict[str, str]]  # claim_id -> error message