"""
Pydantic schemas for API request/response validation and AI structured output.

These schemas ensure type safety and automatic validation at API boundaries.
"""

from datetime import datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field, field_validator
from .models import TicketStatus, UrgencyLevel, TicketCategory


# ============================================================================
# API Request/Response Schemas
# ============================================================================

class TicketCreate(BaseModel):
    """Request schema for creating a new ticket."""
    request_content: str = Field(
        ...,
        min_length=10,
        max_length=5000,
        description="User's complaint or request (10-5000 characters)",
        examples=["My account is locked and I can't access the dashboard"]
    )
    
    @field_validator("request_content")
    @classmethod
    def validate_content(cls, v: str) -> str:
        """Ensure content is not just whitespace."""
        if not v.strip():
            raise ValueError("Request content cannot be empty or just whitespace")
        return v.strip()


class TicketResponse(BaseModel):
    """Response schema for a single ticket."""
    id: UUID
    request_content: str
    status: TicketStatus
    urgency: Optional[UrgencyLevel] = None
    sentiment_score: Optional[int] = Field(None, ge=1, le=10)
    category: Optional[TicketCategory] = None
    draft_response: Optional[str] = None
    created_at: datetime
    
    model_config = {
        "from_attributes": True,  # Enable ORM mode for SQLAlchemy models
        "json_schema_extra": {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "request_content": "My subscription payment failed",
                "status": "completed",
                "urgency": "High",
                "sentiment_score": 8,
                "category": "Billing",
                "draft_response": "We apologize for the inconvenience...",
                "created_at": "2026-02-02T18:42:00Z"
            }
        }
    }


class TicketListResponse(BaseModel):
    """Response schema for listing tickets with pagination."""
    tickets: List[TicketResponse]
    total: int
    limit: int
    offset: int


class HealthCheckResponse(BaseModel):
    """Response schema for health check endpoint."""
    status: str
    database: str
    redis: str
    timestamp: datetime


class ErrorResponse(BaseModel):
    """Standard error response schema."""
    detail: str
    error_code: Optional[str] = None
    request_id: Optional[str] = None
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "detail": "Ticket not found",
                "error_code": "TICKET_NOT_FOUND",
                "request_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479"
            }
        }
    }


# ============================================================================
# AI Worker Schemas
# ============================================================================

class AIAnalysisResult(BaseModel):
    """
    Structured output from AI analysis.
    
    This schema ensures the AI (or mock function) returns data
    in the exact format we expect. Using Pydantic here prevents
    runtime errors from malformed AI responses.
    
    In production, this would be used with OpenAI's structured output feature
    or parsed from the LLM response with error handling.
    """
    urgency: UrgencyLevel = Field(
        ...,
        description="Classified urgency level based on content analysis"
    )
    
    sentiment_score: int = Field(
        ...,
        ge=1,
        le=10,
        description="Sentiment analysis score: 1 (very negative) to 10 (very positive)"
    )
    
    category: TicketCategory = Field(
        ...,
        description="Classified ticket category"
    )
    
    draft_response: str = Field(
        ...,
        min_length=20,
        max_length=2000,
        description="AI-generated draft response to the user"
    )
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "urgency": "High",
                "sentiment_score": 3,
                "category": "Billing",
                "draft_response": "We sincerely apologize for the billing issue you're experiencing..."
            }
        }
    }


class TaskResult(BaseModel):
    """Result schema for Celery task execution."""
    ticket_id: UUID
    success: bool
    message: str
    processing_time_seconds: Optional[float] = None
