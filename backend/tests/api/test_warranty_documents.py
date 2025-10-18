import pytest
from httpx import AsyncClient
from fastapi import FastAPI
from uuid import UUID
import os
from typing import AsyncGenerator

from app.main import app
from app.core.config import settings
from app.models.warranty_document import DocumentType, WarrantyDocumentResponse

# Test data
TEST_DEVICE_ID = "550e8400-e29b-41d4-a716-446655440000"
TEST_USER_ID = "a716446655440000-e29b-41d4-550e8400"
TEST_FILE_CONTENT = b"test warranty document content"

@pytest.fixture
async def test_client() -> AsyncGenerator[AsyncClient, None]:
    async with AsyncClient(app=app, base_url="http://test") as client:
        # Mock auth token
        client.headers["Authorization"] = f"Bearer test_token"
        yield client

@pytest.fixture
def test_file(tmp_path):
    # Create a test file
    file_path = tmp_path / "test_warranty.pdf"
    file_path.write_bytes(TEST_FILE_CONTENT)
    return file_path

async def test_upload_warranty_document(test_client: AsyncClient, test_file):
    # Prepare file upload
    files = {
        "file": ("test_warranty.pdf", open(test_file, "rb"), "application/pdf")
    }
    data = {
        "device_id": TEST_DEVICE_ID,
        "document_type": DocumentType.INVOICE.value
    }

    response = await test_client.post(
        "/api/v1/warranty-documents",
        files=files,
        data=data
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["device_id"] == TEST_DEVICE_ID
    assert data["document_type"] == DocumentType.INVOICE.value
    assert "document_url" in data
    
    # Verify file was saved
    file_path = os.path.join(settings.UPLOAD_DIR, data["document_url"])
    assert os.path.exists(file_path)
    
    return data["id"]  # Return ID for subsequent tests

async def test_get_warranty_document(test_client: AsyncClient):
    # First upload a document
    doc_id = await test_upload_warranty_document(test_client, test_file)
    
    # Try to get it
    response = await test_client.get(f"/api/v1/warranty-documents/{doc_id}")
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == doc_id
    assert data["device_id"] == TEST_DEVICE_ID
    
    # Verify Redis cache
    cache_key = f"warranty_doc:{doc_id}"
    cached = await app.state.redis.get(cache_key)
    assert cached is not None

async def test_delete_warranty_document(test_client: AsyncClient):
    # First upload a document
    doc_id = await test_upload_warranty_document(test_client, test_file)
    
    # Get document URL before deletion
    response = await test_client.get(f"/api/v1/warranty-documents/{doc_id}")
    doc_url = response.json()["document_url"]
    file_path = os.path.join(settings.UPLOAD_DIR, doc_url)
    
    # Delete it
    response = await test_client.delete(f"/api/v1/warranty-documents/{doc_id}")
    
    assert response.status_code == 200
    assert response.json()["status"] == "success"
    
    # Verify file is gone
    assert not os.path.exists(file_path)
    
    # Verify document is gone
    response = await test_client.get(f"/api/v1/warranty-documents/{doc_id}")
    assert response.status_code == 404

async def test_unauthorized_access(test_client: AsyncClient):
    # Remove auth header
    test_client.headers.pop("Authorization", None)
    
    response = await test_client.get("/api/v1/warranty-documents/some-id")
    assert response.status_code == 401