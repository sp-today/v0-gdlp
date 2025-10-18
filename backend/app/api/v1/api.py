from fastapi import APIRouter
from app.api.v1.endpoints import warranty_documents, devices, warranty_claims

api_router = APIRouter()
api_router.include_router(
    devices.router,
    prefix="/devices",
    tags=["devices"]
)
api_router.include_router(
    warranty_documents.router,
    prefix="/warranty-documents",
    tags=["warranty-documents"]
)
api_router.include_router(
    warranty_claims.router,
    prefix="/warranty-claims",
    tags=["warranty-claims"]
)