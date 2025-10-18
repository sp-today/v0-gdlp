from fastapi import HTTPException, status

class DocumentNotFound(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )

class InvalidDocumentFormat(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid document format"
        )

class FileSizeTooLarge(HTTPException):
    def __init__(self, max_size: int):
        super().__init__(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size exceeds maximum allowed size of {max_size} bytes"
        )

class UnauthorizedError(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )