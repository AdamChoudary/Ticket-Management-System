from typing import Any, List, Optional
from uuid import UUID
import logging
from fastapi import APIRouter, Depends, HTTPException, Query, status, Header, Request
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import settings
from app.core.rate_limit import get_limiter
from app.database import get_db
from app.models import Ticket, TicketStatus, TicketCategory
from app.schemas import (
    TicketCreate,
    TicketUpdate,
    TicketResponse,
    TicketListResponse
)
from app.tasks import process_ticket
from app.exceptions import (
    TicketNotFoundException,
    DatabaseException,
)

router = APIRouter()
logger = logging.getLogger(__name__)
limiter = get_limiter()

@router.post(
    "/tickets",
    response_model=TicketResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new support ticket (non-blocking)"
)
@limiter.limit("10/minute")  # Rate limit: 10 requests per minute per IP
async def create_ticket(
    request: Request,
    ticket_data: TicketCreate,
    x_gemini_api_key: Optional[str] = Header(None, alias="X-Gemini-Key"),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new support ticket and queue it for AI processing.
    Optionally accepts X-Gemini-Key header for BYOK (Bring Your Own Key).
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
        
        logger.info(f"Created ticket {new_ticket.id}")
        
        # Trigger background task (non-blocking)
        try:
            # Pass API key if provided
            process_ticket.delay(str(new_ticket.id), api_key=x_gemini_api_key)
            logger.info(f"Queued processing task for ticket {new_ticket.id}")
        except Exception as worker_error:
            logger.error(f"Failed to queue task: {worker_error}")
        
        return TicketResponse.model_validate(new_ticket)
        
    except SQLAlchemyError as e:
        await db.rollback()
        logger.error(f"Database error creating ticket: {e}", exc_info=True)
        raise DatabaseException("Failed to create ticket")
    except Exception as e:
        await db.rollback()
        logger.error(f"Unexpected error creating ticket: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create ticket"
        )


@router.get(
    "/tickets",
    response_model=TicketListResponse,
    summary="List all tickets with optional filters"
)
async def get_tickets(
    status_filter: Optional[TicketStatus] = Query(None, description="Filter by status", alias="status_filter"),
    category_filter: Optional[TicketCategory] = Query(None, description="Filter by category", alias="category_filter"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve a list of tickets with optional filtering and pagination.
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


@router.get(
    "/tickets/{ticket_id}",
    response_model=TicketResponse,
    summary="Get a specific ticket by ID"
)
async def get_ticket(
    ticket_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve details of a specific ticket by its ID.
    """
    try:
        result = await db.execute(select(Ticket).where(Ticket.id == ticket_id))
        ticket = result.scalar_one_or_none()
        
        if not ticket:
            raise TicketNotFoundException(str(ticket_id))
        
        return TicketResponse.model_validate(ticket)
        
    except TicketNotFoundException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"Database error fetching ticket {ticket_id}: {e}", exc_info=True)
        raise DatabaseException("Failed to fetch ticket")
    except Exception as e:
        logger.error(f"Unexpected error fetching ticket {ticket_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch ticket"
        )


@router.patch(
    "/tickets/{ticket_id}",
    response_model=TicketResponse,
    summary="Update ticket (agent edits)",
    tags=["Tickets"]
)
@limiter.limit("30/minute")
async def update_ticket(
    request: Request,
    ticket_id: UUID,
    updates: TicketUpdate,
    db: AsyncSession = Depends(get_db)
):
    """
    Update ticket fields (draft_response, status, urgency, category).
    Used by agents to edit AI drafts or resolve tickets.
    """
    try:
        # Fetch existing ticket
        result = await db.execute(select(Ticket).where(Ticket.id == ticket_id))
        ticket = result.scalar_one_or_none()
        
        if not ticket:
            raise TicketNotFoundException(str(ticket_id))
        
        # Apply updates (only non-None fields)
        update_data = updates.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(ticket, field, value)
        
        await db.commit()
        await db.refresh(ticket)
        
        logger.info(f"Updated ticket {ticket_id}: {list(update_data.keys())}")
        
        return TicketResponse.model_validate(ticket)
        
    except TicketNotFoundException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"Database error updating ticket {ticket_id}: {e}", exc_info=True)
        raise DatabaseException("Failed to update ticket")
    except Exception as e:
        logger.error(f"Failed to update ticket {ticket_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update ticket")
