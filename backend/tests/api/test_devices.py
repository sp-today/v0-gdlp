import pytest
from httpx import AsyncClient
from datetime import date
from uuid import uuid4
from typing import AsyncGenerator, Dict

from app.main import app
from app.models.device import DeviceCreate, WarrantyType

# Test data
TEST_USER_ID = str(uuid4())
TEST_DEVICE = {
    "device_name": "Test iPhone",
    "device_type": "smartphone",
    "brand": "Apple",
    "model": "iPhone 13",
    "serial_number": "ABC123XYZ",
    "purchase_date": str(date.today()),
    "warranty_type": WarrantyType.MANUFACTURER.value
}

@pytest.fixture
async def test_client() -> AsyncGenerator[AsyncClient, None]:
    async with AsyncClient(app=app, base_url="http://test") as client:
        client.headers["Authorization"] = f"Bearer test_token"
        yield client

@pytest.fixture
async def test_device(test_client: AsyncClient) -> Dict:
    response = await test_client.post("/api/v1/devices", json=TEST_DEVICE)
    return response.json()

async def test_create_device(test_client: AsyncClient):
    response = await test_client.post("/api/v1/devices", json=TEST_DEVICE)
    
    assert response.status_code == 201
    data = response.json()
    assert data["device_name"] == TEST_DEVICE["device_name"]
    assert data["serial_number"] == TEST_DEVICE["serial_number"]
    assert "id" in data
    
    return data

async def test_get_devices(test_client: AsyncClient, test_device):
    response = await test_client.get("/api/v1/devices")
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert any(d["id"] == test_device["id"] for d in data)
    
    # Verify Redis cache
    cache_key = f"user_devices:{TEST_USER_ID}"
    cached = await app.state.redis.get(cache_key)
    assert cached is not None

async def test_get_device(test_client: AsyncClient, test_device):
    response = await test_client.get(f"/api/v1/devices/{test_device['id']}")
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_device["id"]
    assert data["device_name"] == test_device["device_name"]
    
    # Verify Redis cache
    cache_key = f"device:{test_device['id']}"
    cached = await app.state.redis.get(cache_key)
    assert cached is not None

async def test_update_device(test_client: AsyncClient, test_device):
    update_data = {
        "device_name": "Updated iPhone"
    }
    response = await test_client.put(
        f"/api/v1/devices/{test_device['id']}", 
        json=update_data
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_device["id"]
    assert data["device_name"] == update_data["device_name"]
    
    # Verify cache invalidation
    cache_key = f"device:{test_device['id']}"
    cached = await app.state.redis.get(cache_key)
    assert cached is None

async def test_delete_device(test_client: AsyncClient, test_device):
    response = await test_client.delete(f"/api/v1/devices/{test_device['id']}")
    
    assert response.status_code == 200
    assert response.json()["status"] == "success"
    
    # Verify device is gone
    response = await test_client.get(f"/api/v1/devices/{test_device['id']}")
    assert response.status_code == 404
    
    # Verify cache invalidation
    cache_key = f"device:{test_device['id']}"
    cached = await app.state.redis.get(cache_key)
    assert cached is None

async def test_unauthorized_access(test_client: AsyncClient):
    test_client.headers.pop("Authorization", None)
    
    response = await test_client.get("/api/v1/devices")
    assert response.status_code == 401