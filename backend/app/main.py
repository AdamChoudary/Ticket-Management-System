"""
FastAPI application entry point for AI Support Hub.

This module provides a production-ready REST API with:
- Async endpoint handlers for high concurrency
- CORS middleware for frontend integration  
- Dependency injection for database sessions
- OpenAPI documentation
- Health check endpoints
- Comprehensive error handling
"""

from contextlib import asynccontextmanager
from datetime import datetime
from typing import Optional, List
from uuid import UUID

from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
import redis.asyncio as aioredis

from .config import settings
from .database import get_db, init_db, close_db
from .models import Ticket, TicketStatus, TicketCategory
from .schemas import (
    TicketCreate,
    TicketResponse,
    TicketListResponse,
    HealthCheckResponse
)
from .tasks import process_ticket


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    
    Handles startup and shutdown events:
    - Startup: Initialize database tables (create if not exist)
    - Shutdown: Close database connections gracefully
    """
    # Startup
    await init_db()
    yield
    # Shutdown
    await close_db()


# Initialize FastAPI application
app = FastAPI(
    title=settings.api_title,
    version=settings.api_version,
    description="""
    AI Support Hub API - Non-blocking ticket processing with background AI triage.
    
    ## Features
    
    * **Non-blocking ticket creation** - Returns immediately, processes in background
    * **Real-time status tracking** - Poll for updates as tickets are processed
    * **AI-powered triage** - Automatic categorization and sentiment analysis
    * **Draft responses** - AI-generated responses for support agents
    
    ## Workflow
    
    1. POST /api/tickets - Submit ticket (instant response)
    2. Backend queues task for Celery worker
    3. Worker processes with AI (3-5 seconds)
    4. GET /api/tickets - Poll for updates
    5. Status changes: pending → processing → completed
    """,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)


# ============================================================================
# Health Check Endpoints
# ============================================================================

@app.get(
    "/health",
    response_model=HealthCheckResponse,
    tags=["Health"],
    summary="Health check endpoint"
)
async def health_check(db: AsyncSession = Depends(get_db)):
    """
    Check the health of the API and its dependencies.
    
    Returns:
        - API status
        - Database connectivity
        - Redis connectivity
        - Current timestamp
    """
    # Check database connection
    try:
        await db.execute(select(1))
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    # Check Redis connection
    try:
        redis_client = await aioredis.from_url(settings.redis_url, decode_responses=True)
        await redis_client.ping()
        await redis_client.close()
        redis_status = "connected"
    except Exception as e:
        redis_status = f"error: {str(e)}"
    
    return HealthCheckResponse(
        status="healthy" if db_status == "connected" and redis_status == "connected" else "degraded",
        database=db_status,
        redis=redis_status,
        timestamp=datetime.utcnow()
    )


# ============================================================================
# Ticket API Endpoints
# ============================================================================

@app.post(
    "/api/tickets",
    response_model=TicketResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Tickets"],
    summary="Create a new support ticket (non-blocking)"
)
async def create_ticket(
    ticket_data: TicketCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new support ticket and queue it for AI processing.
    
    **CRITICAL: This endpoint is non-blocking.**
    
    The ticket is saved to the database with status="pending" and a background
    task is triggered immediately. The API responds in < 100ms regardless of
    AI processing time.
    
    Workflow:
    1. Validate request payload
    2. Create ticket in database (status="pending")
    3. Trigger Celery task for AI processing
    4. Return ticket ID immediately
    5. Worker processes in background
    6. Frontend polls for status updates
    
    Args:
        ticket_data: User's complaint/request
        
    Returns:
        Ticket object with ID and pending status
        
    Example:
        ```bash
        curl -X POST http://localhost:8000/api/tickets \\
          -H "Content-Type: application/json" \\
          -d '{"request_content": "My account is locked"}'
        ```
    """
    try:
        # Create new ticket in database
        new_ticket = Ticket(
            request_content=ticket_data.request_content,
            status=TicketStatus.PENDING,
        )
        
        db.add(new_ticket)
        await db.commit()
        await db.refresh(new_ticket)
        
        # Trigger background task (non-blocking)
        # The .delay() method queues the task and returns immediately
        process_ticket.delay(str(new_ticket.id))
        
        return TicketResponse.model_validate(new_ticket)
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create ticket: {str(e)}"
        )


@app.get(
    "/api/tickets",
    response_model=TicketListResponse,
    tags=["Tickets"],
    summary="List all tickets with optional filters"
)
async def get_tickets(
    status_filter: Optional[TicketStatus] = Query(None, description="Filter by status"),
    category_filter: Optional[TicketCategory] = Query(None, description="Filter by category"),
    limit: int = Query(50, ge=1, le=100, description="Number of results per page"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve a list of tickets with optional filtering and pagination.
    
    This endpoint supports:
    - **Status filtering**: pending, processing, completed, failed
    - **Category filtering**: Billing, Technical, Feature
    - **Pagination**: limit and offset parameters
    - **Sorting**: By created_at descending (newest first)
    
    Frontend should poll this endpoint every 3-5 seconds to show
    real-time status updates as tickets move through the workflow.
    
    Args:
        status_filter: Optional status filter
        category_filter: Optional category filter
        limit: Results per page (1-100)
        offset: Pagination offset
        
    Returns:
        List of tickets with total count
        
    Example:
        ```bash
        # Get all pending tickets
        curl http://localhost:8000/api/tickets?status_filter=pending
        
        # Get second page of completed tickets
        curl http://localhost:8000/api/tickets?status_filter=completed&limit=10&offset=10
        ```
    """
    try:
        # Build query with filters
        query = select(Ticket)
        
        if status_filter:
            query = query.where(Ticket.status == status_filter)
        
        if category_filter:
            query = query.where(Ticket.category == category_filter)
        
        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar()
        
        # Apply pagination and sorting
        query = query.order_by(Ticket.created_at.desc()).limit(limit).offset(offset)
        
        # Execute query
        result = await db.execute(query)
        tickets = result.scalars().all()
        
        return TicketListResponse(
            tickets=[TicketResponse.model_validate(ticket) for ticket in tickets],
            total=total,
            limit=limit,
            offset=offset
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch tickets: {str(e)}"
        )


@app.get(
    "/api/tickets/{ticket_id}",
    response_model=TicketResponse,
    tags=["Tickets"],
    summary="Get a specific ticket by ID"
)
async def get_ticket(
    ticket_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve details of a specific ticket by its ID.
    
    Use this endpoint to:
    - Check the current status of a ticket
    - View AI analysis results (urgency, sentiment, category)
    - Read the draft response generated by AI
    
    Args:
        ticket_id: UUID of the ticket
        
    Returns:
        Complete ticket details
        
    Raises:
        404: Ticket not found
        
    Example:
        ```bash
        curl http://localhost:8000/api/tickets/123e4567-e89b-12d3-a456-426614174000
        ```
    """
    try:
        result = await db.execute(select(Ticket).where(Ticket.id == ticket_id))
        ticket = result.scalar_one_or_none()
        
        if not ticket:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Ticket {ticket_id} not found"
            )
        
        return TicketResponse.model_validate(ticket)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch ticket: {str(e)}"
        )


# ============================================================================
# Root Endpoint
# ============================================================================

@app.get("/", tags=["Root"])
async def root():
    """
    API root endpoint with basic information.
    
    Returns links to documentation and health check.
    """
    return {
        "message": "AI Support Hub API",
        "version": settings.api_version,
        "docs": "/docs",
        "health": "/health",
        "github": "https://github.com/yourusername/ai-support-hub"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
