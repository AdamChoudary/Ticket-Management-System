"""
Custom exception classes for structured error handling.

Provides a hierarchy of exceptions for different error scenarios
with proper HTTP status codes and error messages.
"""

from typing import Any, Dict, Optional
from fastapi import HTTPException, status


class BaseAPIException(HTTPException):
    """Base exception for all API errors."""
    
    def __init__(
        self,
        status_code: int,
        detail: str,
        headers: Optional[Dict[str, Any]] = None,
        error_code: Optional[str] = None,
    ):
        super().__init__(status_code=status_code, detail=detail, headers=headers)
        self.error_code = error_code or self.__class__.__name__


class TicketNotFoundException(BaseAPIException):
    """Raised when a ticket is not found."""
    
    def __init__(self, ticket_id: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket {ticket_id} not found",
            error_code="TICKET_NOT_FOUND"
        )


class ValidationException(BaseAPIException):
    """Raised when request validation fails."""
    
    def __init__(self, detail: str, field: Optional[str] = None):
        error_detail = f"{field}: {detail}" if field else detail
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=error_detail,
            error_code="VALIDATION_ERROR"
        )


class DatabaseException(BaseAPIException):
    """Raised when database operation fails."""
    
    def __init__(self, detail: str = "Database operation failed"):
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=detail,
            error_code="DATABASE_ERROR"
        )


class WorkerException(BaseAPIException):
    """Raised when background worker operation fails."""
    
    def __init__(self, detail: str = "Background task failed"):
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=detail,
            error_code="WORKER_ERROR"
        )


class RateLimitException(BaseAPIException):
    """Raised when rate limit is exceeded."""
    
    def __init__(self, retry_after: int = 60):
        super().__init__(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests. Please try again later.",
            headers={"Retry-After": str(retry_after)},
            error_code="RATE_LIMIT_EXCEEDED"
        )
