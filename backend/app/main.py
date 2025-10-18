from typing import Dict
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.exceptions import (
    DocumentNotFound,
    InvalidDocumentFormat,
    FileSizeTooLarge,
    UnauthorizedError
)
from app.api.v1.api import api_router
from app.schemas.error import ErrorResponse

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    version=settings.VERSION,
    description="Global Digital Legal Passport API",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add v1 API router
app.include_router(api_router, prefix=settings.API_V1_STR)

# Exception handlers
@app.exception_handler(DocumentNotFound)
@app.exception_handler(InvalidDocumentFormat)
@app.exception_handler(FileSizeTooLarge)
@app.exception_handler(UnauthorizedError)
async def http_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            detail=exc.detail,
            code=exc.__class__.__name__
        ).model_dump()
    )

# Health check endpoint
@app.get("/health")
async def health_check() -> Dict[str, str]:
    return {
        "status": "healthy",
        "version": settings.VERSION
    }