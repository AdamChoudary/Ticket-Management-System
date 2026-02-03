"""
SQLAlchemy ORM models for the database schema.

This module defines the database structure for the AI Support Hub.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Integer, DateTime, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
import enum
from .database import Base


class TicketStatus(str, enum.Enum):
    """
    Ticket workflow status.
    
    - PENDING: Just created, waiting for worker to pick up
    - PROCESSING: Worker is currently analyzing with AI
    - COMPLETED: Successfully processed with AI results
    - FAILED: Processing failed (AI error, validation error, etc.)
    """
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class UrgencyLevel(str, enum.Enum):
    """AI-determined urgency classification."""
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"


class TicketCategory(str, enum.Enum):
    """AI-determined ticket category."""
    BILLING = "Billing"
    TECHNICAL = "Technical"
    FEATURE = "Feature"
    OTHER = "Other"


class Ticket(Base):
    """
    Support ticket model representing a user complaint/request.
    
    Workflow:
    1. Created with status=PENDING and only request_content populated
    2. Worker picks it up, sets status=PROCESSING
    3. Worker calls AI, fills urgency/sentiment/category/draft_response
    4. Worker sets status=COMPLETED (or FAILED on error)
    """
    __tablename__ = "tickets"
    
    # Primary key
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
        comment="Unique ticket identifier"
    )
    
    # User input (required)
    request_content = Column(
        Text,
        nullable=False,
        comment="Raw user complaint or request text"
    )
    
    # Workflow status (required, indexed for queries)
    status = Column(
        SQLEnum(TicketStatus),
        nullable=False,
        default=TicketStatus.PENDING,
        index=True,
        comment="Current processing status"
    )
    
    # AI-populated fields (nullable initially)
    urgency = Column(
        SQLEnum(UrgencyLevel),
        nullable=True,
        comment="AI-determined urgency level"
    )
    
    sentiment_score = Column(
        Integer,
        nullable=True,
        comment="AI sentiment analysis score (1-10 scale)"
    )
    
    category = Column(
        SQLEnum(TicketCategory),
        nullable=True,
        index=True,
        comment="AI-determined category"
    )
    
    draft_response = Column(
        Text,
        nullable=True,
        comment="AI-generated draft response to the user"
    )
    
    # Metadata
    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        index=True,
        comment="Timestamp when ticket was created"
    )
    
    def __repr__(self) -> str:
        return f"<Ticket(id={self.id}, status={self.status}, category={self.category})>"
