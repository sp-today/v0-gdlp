from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from uuid import UUID

from app.core.auth import get_current_user
from app.core.cache import RedisCache
from app.db.session import get_db
from app.models.warranty_claim import (
    WarrantyClaimCreate,
    WarrantyClaimUpdate,
    WarrantyClaimResponse,
    BatchClaimCreate,
    BatchClaimUpdate,
    BatchClaimResponse,
    ClaimStatus,
    ClaimType
)
from app.db.models.warranty_claim import WarrantyClaim
from app.db.models.device import Device

router = APIRouter()

async def verify_device_ownership(db: AsyncSession, device_id: UUID, user_id: UUID) -> bool:
    """Verify that a device belongs to the user."""
    device = await db.get(Device, device_id)
    return device and device.user_id == user_id

@router.post("/", response_model=WarrantyClaimResponse)
async def create_warranty_claim(
    claim: WarrantyClaimCreate,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user),
    cache: RedisCache = Depends()
):
    """Create a new warranty claim."""
    # Verify device ownership
    if not await verify_device_ownership(db, claim.device_id, current_user):
        raise HTTPException(
            status_code=403,
            detail="Not authorized to create claim for this device"
        )
    
    db_claim = WarrantyClaim(**claim.dict(), user_id=current_user)
    db.add(db_claim)
    await db.commit()
    await db.refresh(db_claim)
    
    # Invalidate cache
    await cache.delete(f"user_claims:{current_user}")
    
    return db_claim

@router.post("/batch", response_model=BatchClaimResponse)
async def create_warranty_claims_batch(
    batch: BatchClaimCreate,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user),
    cache: RedisCache = Depends()
):
    """Create multiple warranty claims in a single request."""
    succeeded = []
    failed = []
    
    for claim in batch.claims:
        try:
            if not await verify_device_ownership(db, claim.device_id, current_user):
                failed.append({
                    "data": claim.dict(),
                    "error": "Not authorized for this device"
                })
                continue
                
            db_claim = WarrantyClaim(**claim.dict(), user_id=current_user)
            db.add(db_claim)
            await db.commit()
            await db.refresh(db_claim)
            succeeded.append(db_claim)
        except Exception as e:
            await db.rollback()
            failed.append({
                "data": claim.dict(),
                "error": str(e)
            })
    
    # Invalidate cache
    if succeeded:
        await cache.delete(f"user_claims:{current_user}")
    
    return BatchClaimResponse(succeeded=succeeded, failed=failed)

@router.get("/", response_model=List[WarrantyClaimResponse])
async def get_warranty_claims(
    status: Optional[ClaimStatus] = None,
    claim_type: Optional[ClaimType] = None,
    device_id: Optional[UUID] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    limit: int = Query(default=50, le=100),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user),
    cache: RedisCache = Depends()
):
    """Get warranty claims with filtering."""
    # Build cache key based on filters
    cache_key = f"user_claims:{current_user}:f={status}:{claim_type}:{device_id}:{start_date}:{end_date}:{limit}:{offset}"
    
    # Try cache first
    if cached := await cache.get(cache_key):
        return [WarrantyClaimResponse.parse_raw(c) for c in cached]
    
    # Build query
    query = select(WarrantyClaim).where(WarrantyClaim.user_id == current_user)
    
    if status:
        query = query.where(WarrantyClaim.claim_status == status)
    if claim_type:
        query = query.where(WarrantyClaim.claim_type == claim_type)
    if device_id:
        query = query.where(WarrantyClaim.device_id == device_id)
    if start_date:
        query = query.where(WarrantyClaim.created_at >= start_date)
    if end_date:
        query = query.where(WarrantyClaim.created_at <= end_date)
    
    # Add pagination
    query = query.offset(offset).limit(limit)
    
    # Execute query
    claims = await db.execute(query)
    claims = claims.scalars().all()
    
    # Cache for 5 minutes
    await cache.set(
        cache_key,
        [c.json() for c in claims],
        expire_seconds=300
    )
    
    return claims

@router.get("/{claim_id}", response_model=WarrantyClaimResponse)
async def get_warranty_claim(
    claim_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user),
    cache: RedisCache = Depends()
):
    """Get a specific warranty claim."""
    # Try cache first
    cache_key = f"claim:{claim_id}"
    if cached := await cache.get(cache_key):
        return WarrantyClaimResponse.parse_raw(cached)
    
    # Get from DB
    claim = await db.get(WarrantyClaim, claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    
    if claim.user_id != current_user:
        raise HTTPException(status_code=403, detail="Not authorized to access this claim")
    
    # Cache for 5 minutes
    await cache.set(
        cache_key,
        claim.json(),
        expire_seconds=300
    )
    
    return claim

@router.put("/batch", response_model=BatchClaimResponse)
async def update_warranty_claims_batch(
    batch: BatchClaimUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user),
    cache: RedisCache = Depends()
):
    """Update multiple warranty claims in a single request."""
    succeeded = []
    failed = []
    
    for claim_id in batch.claim_ids:
        try:
            claim = await db.get(WarrantyClaim, claim_id)
            if not claim:
                failed.append({
                    "id": str(claim_id),
                    "error": "Claim not found"
                })
                continue
                
            if claim.user_id != current_user:
                failed.append({
                    "id": str(claim_id),
                    "error": "Not authorized"
                })
                continue
            
            # Update fields
            update_data = batch.update.dict(exclude_unset=True)
            for field, value in update_data.items():
                setattr(claim, field, value)
            
            claim.updated_at = datetime.utcnow()
            await db.commit()
            await db.refresh(claim)
            succeeded.append(claim)
            
            # Invalidate cache
            await cache.delete(f"claim:{claim_id}")
        except Exception as e:
            await db.rollback()
            failed.append({
                "id": str(claim_id),
                "error": str(e)
            })
    
    # Invalidate list cache if any succeeded
    if succeeded:
        await cache.delete(f"user_claims:{current_user}")
    
    return BatchClaimResponse(succeeded=succeeded, failed=failed)

@router.put("/{claim_id}", response_model=WarrantyClaimResponse)
async def update_warranty_claim(
    claim_id: UUID,
    claim_update: WarrantyClaimUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user),
    cache: RedisCache = Depends()
):
    """Update a warranty claim."""
    claim = await db.get(WarrantyClaim, claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    
    if claim.user_id != current_user:
        raise HTTPException(status_code=403, detail="Not authorized to update this claim")
    
    # Update fields
    update_data = claim_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(claim, field, value)
    
    claim.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(claim)
    
    # Invalidate caches
    await cache.delete(f"claim:{claim_id}")
    await cache.delete(f"user_claims:{current_user}")
    
    return claim

@router.delete("/{claim_id}")
async def delete_warranty_claim(
    claim_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user),
    cache: RedisCache = Depends()
):
    """Delete a warranty claim."""
    claim = await db.get(WarrantyClaim, claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    
    if claim.user_id != current_user:
        raise HTTPException(status_code=403, detail="Not authorized to delete this claim")
    
    await db.delete(claim)
    await db.commit()
    
    # Invalidate caches
    await cache.delete(f"claim:{claim_id}")
    await cache.delete(f"user_claims:{current_user}")
    
    return {"status": "success"}