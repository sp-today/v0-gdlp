import json
import uuid
from datetime import datetime, timedelta
from typing import AsyncGenerator, List

import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from unittest.mock import AsyncMock

from app.api.v1.endpoints.warranty_claims import router
from app.core.auth import get_current_user
from app.core.cache import RedisCache
from app.db.models.device import Device
from app.db.models.warranty_claim import WarrantyClaim
from app.models.warranty_claim import ClaimStatus, ClaimType

# Test data
TEST_USER_ID = str(uuid.uuid4())
TEST_DEVICE_ID = str(uuid.uuid4())

@pytest.fixture
def app(session: AsyncSession) -> FastAPI:
    """Create test FastAPI app with dependencies."""
    app = FastAPI()
    app.include_router(router)
    
    async def get_test_user():
        return TEST_USER_ID
    
    app.dependency_overrides[get_current_user] = get_test_user
    app.dependency_overrides[AsyncSession] = lambda: session
    
    # Mock Redis cache
    mock_cache = AsyncMock(spec=RedisCache)
    mock_cache.get.return_value = None
    app.dependency_overrides[RedisCache] = lambda: mock_cache
    
    return app

@pytest.fixture
async def test_device(session: AsyncSession) -> Device:
    """Create a test device."""
    device = Device(
        id=TEST_DEVICE_ID,
        user_id=TEST_USER_ID,
        name="Test Device",
        model="Test Model",
        serial_number="123456"
    )
    session.add(device)
    await session.commit()
    return device

@pytest.fixture
async def test_claims(session: AsyncSession, test_device: Device) -> List[WarrantyClaim]:
    """Create test warranty claims."""
    claims = []
    for i in range(3):
        claim = WarrantyClaim(
            user_id=TEST_USER_ID,
            device_id=test_device.id,
            claim_type=ClaimType.repair,
            claim_status=ClaimStatus.pending,
            description=f"Test claim {i}",
            issue_date=datetime.utcnow() - timedelta(days=i)
        )
        session.add(claim)
        claims.append(claim)
    
    await session.commit()
    return claims

async def test_create_warranty_claim(
    app: FastAPI,
    client: AsyncClient,
    test_device: Device
):
    """Test creating a single warranty claim."""
    response = await client.post(
        "/",
        json={
            "device_id": str(test_device.id),
            "claim_type": "repair",
            "claim_status": "pending",
            "description": "Test claim",
            "issue_date": datetime.utcnow().isoformat()
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["device_id"] == str(test_device.id)
    assert data["claim_type"] == "repair"
    assert data["user_id"] == TEST_USER_ID

async def test_create_warranty_claims_batch(
    app: FastAPI,
    client: AsyncClient,
    test_device: Device
):
    """Test creating multiple warranty claims in batch."""
    claims = [
        {
            "device_id": str(test_device.id),
            "claim_type": "repair",
            "claim_status": "pending",
            "description": f"Test claim {i}",
            "issue_date": datetime.utcnow().isoformat()
        }
        for i in range(3)
    ]
    
    response = await client.post(
        "/batch",
        json={"claims": claims}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert len(data["succeeded"]) == 3
    assert len(data["failed"]) == 0
    for claim in data["succeeded"]:
        assert claim["user_id"] == TEST_USER_ID

async def test_get_warranty_claims(
    app: FastAPI,
    client: AsyncClient,
    test_claims: List[WarrantyClaim]
):
    """Test retrieving warranty claims with filters."""
    # Test without filters
    response = await client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3
    
    # Test with status filter
    response = await client.get("/?status=pending")
    assert response.status_code == 200
    data = response.json()
    assert all(claim["claim_status"] == "pending" for claim in data)
    
    # Test with date filter
    yesterday = (datetime.utcnow() - timedelta(days=1)).isoformat()
    response = await client.get(f"/?start_date={yesterday}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2  # Should only get claims from last day

async def test_get_warranty_claim(
    app: FastAPI,
    client: AsyncClient,
    test_claims: List[WarrantyClaim]
):
    """Test retrieving a single warranty claim."""
    claim_id = test_claims[0].id
    response = await client.get(f"/{claim_id}")
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(claim_id)
    assert data["user_id"] == TEST_USER_ID

async def test_update_warranty_claim(
    app: FastAPI,
    client: AsyncClient,
    test_claims: List[WarrantyClaim]
):
    """Test updating a single warranty claim."""
    claim_id = test_claims[0].id
    response = await client.put(
        f"/{claim_id}",
        json={
            "claim_status": "approved",
            "description": "Updated description"
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["claim_status"] == "approved"
    assert data["description"] == "Updated description"

async def test_update_warranty_claims_batch(
    app: FastAPI,
    client: AsyncClient,
    test_claims: List[WarrantyClaim]
):
    """Test updating multiple warranty claims in batch."""
    claim_ids = [str(claim.id) for claim in test_claims]
    response = await client.put(
        "/batch",
        json={
            "claim_ids": claim_ids,
            "update": {
                "claim_status": "approved"
            }
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert len(data["succeeded"]) == 3
    assert len(data["failed"]) == 0
    assert all(claim["claim_status"] == "approved" for claim in data["succeeded"])

async def test_delete_warranty_claim(
    app: FastAPI,
    client: AsyncClient,
    test_claims: List[WarrantyClaim]
):
    """Test deleting a warranty claim."""
    claim_id = test_claims[0].id
    response = await client.delete(f"/{claim_id}")
    
    assert response.status_code == 200
    
    # Verify deletion
    response = await client.get(f"/{claim_id}")
    assert response.status_code == 404

async def test_unauthorized_access(
    app: FastAPI,
    client: AsyncClient,
    session: AsyncSession
):
    """Test unauthorized access to claims."""
    # Create a claim owned by different user
    other_user_claim = WarrantyClaim(
        id=uuid.uuid4(),
        user_id=str(uuid.uuid4()),  # Different user
        device_id=TEST_DEVICE_ID,
        claim_type=ClaimType.repair,
        claim_status=ClaimStatus.pending,
        description="Other user's claim"
    )
    session.add(other_user_claim)
    await session.commit()
    
    # Try to access
    response = await client.get(f"/{other_user_claim.id}")
    assert response.status_code == 403
    
    # Try to update
    response = await client.put(
        f"/{other_user_claim.id}",
        json={"claim_status": "approved"}
    )
    assert response.status_code == 403
    
    # Try to delete
    response = await client.delete(f"/{other_user_claim.id}")
    assert response.status_code == 403

async def test_invalid_device(
    app: FastAPI,
    client: AsyncClient
):
    """Test creating claim for non-existent device."""
    response = await client.post(
        "/",
        json={
            "device_id": str(uuid.uuid4()),  # Random non-existent device
            "claim_type": "repair",
            "claim_status": "pending",
            "description": "Test claim"
        }
    )
    
    assert response.status_code == 403

async def test_pagination(
    app: FastAPI,
    client: AsyncClient,
    test_claims: List[WarrantyClaim]
):
    """Test pagination of warranty claims."""
    # Test limit
    response = await client.get("/?limit=2")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    
    # Test offset
    response = await client.get("/?offset=1")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2  # Should get 2 claims (out of 3)