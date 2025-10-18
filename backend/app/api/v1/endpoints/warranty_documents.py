import os
import aiofiles
import hashlib
from datetime import datetime
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from app.core.auth import get_current_user
from app.core.cache import RedisCache
from app.db.session import get_db
from app.models.warranty_document import (
    WarrantyDocumentCreate,
    WarrantyDocumentResponse,
    DocumentType
)
from app.db.models.warranty_document import WarrantyDocument
from app.db.models.device import Device
from app.core.config import settings

router = APIRouter()

async def save_upload_file(upload_file: UploadFile, device_id: UUID, doc_type: DocumentType) -> str:
    """Save uploaded file to local storage with proper directory structure."""
    # Create device-specific directory
    device_dir = os.path.join(settings.UPLOAD_DIR, str(device_id), doc_type.value)
    os.makedirs(device_dir, exist_ok=True)
    
    # Generate unique filename with timestamp and hash
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    content_hash = hashlib.md5(await upload_file.read()).hexdigest()[:8]
    file_ext = os.path.splitext(upload_file.filename)[1]
    filename = f"{timestamp}_{content_hash}{file_ext}"
    
    # Save file
    file_path = os.path.join(device_dir, filename)
    await upload_file.seek(0)
    async with aiofiles.open(file_path, 'wb') as f:
        content = await upload_file.read()
        await f.write(content)
    
    # Return relative path for storage in DB
    return os.path.join(str(device_id), doc_type.value, filename)

@router.post("/", response_model=WarrantyDocumentResponse)
async def create_warranty_document(
    file: UploadFile = File(...),
    device_id: UUID = Form(...),
    document_type: DocumentType = Form(...),
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user),
    cache: RedisCache = Depends()
):
    """Upload a new warranty document."""
    # Verify device ownership
    device = await db.get(Device, device_id)
    if not device or device.user_id != current_user:
        raise HTTPException(status_code=403, detail="Not authorized to upload for this device")
    
    # Save file
    try:
        relative_path = await save_upload_file(file, device_id, document_type)
        doc = WarrantyDocument(
            device_id=device_id,
            document_type=document_type,
            document_url=relative_path
        )
        db.add(doc)
        await db.commit()
        await db.refresh(doc)
        
        # Invalidate cache
        cache_key = f"warranty_docs:{device_id}"
        await cache.delete(cache_key)
        
        return doc
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{document_id}", response_model=WarrantyDocumentResponse)
async def get_warranty_document(
    document_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user),
    cache: RedisCache = Depends()
):
    """Get a specific warranty document."""
    # Try cache first
    cache_key = f"warranty_doc:{document_id}"
    if cached := await cache.get(cache_key):
        return WarrantyDocumentResponse.parse_raw(cached)
    
    # Get from DB
    doc = await db.get(WarrantyDocument, document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Verify ownership via device
    device = await db.get(Device, doc.device_id)
    if not device or device.user_id != current_user:
        raise HTTPException(status_code=403, detail="Not authorized to access this document")
    
    # Cache for 5 minutes
    await cache.set(
        cache_key,
        doc.json(),
        expire_seconds=300
    )
    
    return doc

@router.delete("/{document_id}")
async def delete_warranty_document(
    document_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user),
    cache: RedisCache = Depends()
):
    """Delete a warranty document and its file."""
    # Get document
    doc = await db.get(WarrantyDocument, document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Verify ownership via device
    device = await db.get(Device, doc.device_id)
    if not device or device.user_id != current_user:
        raise HTTPException(status_code=403, detail="Not authorized to delete this document")
    
    try:
        # Delete file
        file_path = os.path.join(settings.UPLOAD_DIR, doc.document_url)
        if os.path.exists(file_path):
            os.remove(file_path)
        
        # Delete from DB
        await db.delete(doc)
        await db.commit()
        
        # Invalidate caches
        await cache.delete(f"warranty_doc:{document_id}")
        await cache.delete(f"warranty_docs:{doc.device_id}")
        
        return {"status": "success"}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))