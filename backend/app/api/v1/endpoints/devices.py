from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from app.core.auth import get_current_user
from app.core.cache import RedisCache
from app.db.session import get_db
from app.models.device import DeviceCreate, DeviceUpdate, DeviceResponse
from app.db.models.device import Device

router = APIRouter()

@router.post("/", response_model=DeviceResponse)
async def create_device(
    device: DeviceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user),
    cache: RedisCache = Depends()
):
    """Create a new device."""
    db_device = Device(**device.dict(), user_id=current_user)
    db.add(db_device)
    await db.commit()
    await db.refresh(db_device)
    
    # Invalidate user's devices cache
    await cache.delete(f"user_devices:{current_user}")
    
    return db_device

@router.get("/", response_model=List[DeviceResponse])
async def get_user_devices(
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user),
    cache: RedisCache = Depends()
):
    """Get all devices for the current user."""
    # Try cache first
    cache_key = f"user_devices:{current_user}"
    if cached := await cache.get(cache_key):
        return [DeviceResponse.parse_raw(d) for d in cached]
    
    # Get from DB
    result = await db.execute(select(Device).where(Device.user_id == current_user))
    devices = result.scalars().all()
    
    # Cache for 5 minutes
    await cache.set(
        cache_key,
        [d.json() for d in devices],
        expire_seconds=300
    )
    
    return devices

@router.get("/{device_id}", response_model=DeviceResponse)
async def get_device(
    device_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user),
    cache: RedisCache = Depends()
):
    """Get a specific device."""
    # Try cache first
    cache_key = f"device:{device_id}"
    if cached := await cache.get(cache_key):
        return DeviceResponse.parse_raw(cached)
    
    # Get from DB
    device = await db.get(Device, device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
        
    if device.user_id != current_user:
        raise HTTPException(status_code=403, detail="Not authorized to access this device")
    
    # Cache for 5 minutes
    await cache.set(
        cache_key,
        device.json(),
        expire_seconds=300
    )
    
    return device

@router.put("/{device_id}", response_model=DeviceResponse)
async def update_device(
    device_id: UUID,
    device_update: DeviceUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user),
    cache: RedisCache = Depends()
):
    """Update a device."""
    db_device = await db.get(Device, device_id)
    if not db_device:
        raise HTTPException(status_code=404, detail="Device not found")
        
    if db_device.user_id != current_user:
        raise HTTPException(status_code=403, detail="Not authorized to update this device")
    
    # Update fields
    update_data = device_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_device, field, value)
    
    db_device.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(db_device)
    
    # Invalidate caches
    await cache.delete(f"device:{device_id}")
    await cache.delete(f"user_devices:{current_user}")
    
    return db_device

@router.delete("/{device_id}")
async def delete_device(
    device_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user),
    cache: RedisCache = Depends()
):
    """Delete a device."""
    db_device = await db.get(Device, device_id)
    if not db_device:
        raise HTTPException(status_code=404, detail="Device not found")
        
    if db_device.user_id != current_user:
        raise HTTPException(status_code=403, detail="Not authorized to delete this device")
    
    await db.delete(db_device)
    await db.commit()
    
    # Invalidate caches
    await cache.delete(f"device:{device_id}")
    await cache.delete(f"user_devices:{current_user}")
    
    return {"status": "success"}