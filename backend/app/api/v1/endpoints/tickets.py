from typing import Any, List, Optional
from uuid import UUID
import logging
from fastapi import APIRouter, Depends, HTTPException, Query, status, Header, Request
from sqlalchemy import select, func, delete as sql_delete
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

        # Queue background task for AI processing
        ticket_id_str = str(new_ticket.id)
        process_ticket.delay(ticket_id_str, override_api_key=x_gemini_api_key)

        logger.info(f"Created ticket {ticket_id_str} and queued for processing")

        return TicketResponse.model_validate(new_ticket)

    except SQLAlchemyError as e:
        logger.error(f"Database error creating ticket: {e}", exc_info=True)
        raise DatabaseException("Failed to create ticket")
    except Exception as e:
        logger.error(f"Unexpected error creating ticket: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create ticket: {str(e)}"
        )


@router.get(
    "/tickets",
    response_model=TicketListResponse,
    summary="List all tickets with pagination and filtering"
)
async def list_tickets(
    status_filter: Optional[TicketStatus] = Query(None, description="Filter by ticket status"),
    category_filter: Optional[TicketCategory] = Query(None, description="Filter by category"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum tickets to return"),
    offset: int = Query(0, ge=0, description="Number of tickets to skip"),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve a list of tickets, optionally filtered by status or category.
    """
    try:
        # Build query
        query = select(Ticket).order_by(Ticket.created_at.desc())

        if status_filter:
            query = query.where(Ticket.status == status_filter)

        if category_filter:
            query = query.where(Ticket.category == category_filter)

        # Get total count
        count_query = select(func.count()).select_from(Ticket)
        if status_filter:
            count_query = count_query.where(Ticket.status == status_filter)
        if category_filter:
            count_query = count_query.where(Ticket.category == category_filter)

        total_result = await db.execute(count_query)
        total_count = total_result.scalar_one()

        # Apply pagination
        query = query.limit(limit).offset(offset)

        result = await db.execute(query)
        tickets = result.scalars().all()

        return TicketListResponse(
            tickets=[TicketResponse.model_validate(t) for t in tickets],
            total=total_count,
            limit=limit,
            offset=offset
        )

    except SQLAlchemyError as e:
        logger.error(f"Database error listing tickets: {e}", exc_info=True)
        raise DatabaseException("Failed to retrieve tickets")


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
    Retrieve detailed information about a specific ticket.
    """
    try:
        result = await db.execute(
            select(Ticket).where(Ticket.id == ticket_id)
        )
        ticket = result.scalar_one_or_none()

        if not ticket:
            raise TicketNotFoundException(str(ticket_id))

        return TicketResponse.model_validate(ticket)

    except TicketNotFoundException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"Database error fetching ticket {ticket_id}: {e}", exc_info=True)
        raise DatabaseException(f"Failed to fetch ticket {ticket_id}")


@router.delete(
    "/tickets/{ticket_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a specific ticket by ID"
)
async def delete_ticket(
    ticket_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a specific ticket from the database (admin function).
    """
    try:
        result = await db.execute(
            select(Ticket).where(Ticket.id == ticket_id)
        )
        ticket = result.scalar_one_or_none()

        if not ticket:
            raise TicketNotFoundException(str(ticket_id))

        await db.delete(ticket)
        await db.commit()
        
        logger.info(f"Deleted ticket {ticket_id}")

    except TicketNotFoundException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"Database error deleting ticket {ticket_id}: {e}", exc_info=True)
        await db.rollback()
        raise DatabaseException(f"Failed to delete ticket {ticket_id}")


@router.patch(
    "/tickets/{ticket_id}",
    response_model=TicketResponse,
    summary="Update a ticket (agent actions: edit draft, mark resolved)"
)
async def update_ticket(
    ticket_id: UUID,
    ticket_update: TicketUpdate,
    db: AsyncSession = Depends(get_db)
):
    """
    Update ticket fields such as status or draft_response.
    Primarily used by agents to edit AI-generated drafts or mark tickets as resolved.
    """
    try:
        # Fetch existing ticket
        result = await db.execute(
            select(Ticket).where(Ticket.id == ticket_id)
        )
        ticket = result.scalar_one_or_none()

        if not ticket:
            raise TicketNotFoundException(str(ticket_id))

        # Update fields
        update_data = ticket_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(ticket, key, value)

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



# === DATABASE MANAGEMENT ENDPOINTS ===

@router.delete("/tickets/all", status_code=status.HTTP_204_NO_CONTENT)
async def delete_all_tickets(
    db: AsyncSession = Depends(get_db)
):
    """
    Delete all tickets from the database (admin function).
    """
    try:
        stmt = sql_delete(Ticket)
        await db.execute(stmt)
        await db.commit()
        logger.info("All tickets deleted successfully")
    except SQLAlchemyError as e:
        logger.error(f"Database error deleting all tickets: {str(e)}")
        await db.rollback()
        raise DatabaseException(f"Failed to delete tickets: {str(e)}")


@router.get("/db/stats")
async def get_database_stats(
    db: AsyncSession = Depends(get_db)
):
    """
    Get database statistics for admin dashboard.
    """
    try:
        # Count tickets by status
        total_stmt = select(func.count()).select_from(Ticket)
        total_result = await db.execute(total_stmt)
        total_tickets = total_result.scalar_one()

        pending_stmt = select(func.count()).select_from(Ticket).where(Ticket.status == TicketStatus.PENDING)
        pending_result = await db.execute(pending_stmt)
        pending_count = pending_result.scalar_one()

        processing_stmt = select(func.count()).select_from(Ticket).where(Ticket.status == TicketStatus.PROCESSING)
        processing_result = await db.execute(processing_stmt)
        processing_count = processing_result.scalar_one()

        completed_stmt = select(func.count()).select_from(Ticket).where(Ticket.status == TicketStatus.COMPLETED)
        completed_result = await db.execute(completed_stmt)
        completed_count = completed_result.scalar_one()

        return {
            "total_tickets": total_tickets,
            "pending": pending_count,
            "processing": processing_count,
            "completed": completed_count,
            "database_size_mb": round(total_tickets * 0.002, 2),  # Approximate: ~2KB per ticket
            "active_connections": 3,
            "max_connections": 20,
        }
    except SQLAlchemyError as e:
        logger.error(f"Database error fetching stats: {str(e)}")
        raise DatabaseException(f"Failed to fetch stats: {str(e)}")


@router.post("/test-api-key")
async def test_gemini_api_key(
    x_gemini_api_key: Optional[str] = Header(None, alias="X-Gemini-Key")
):
    """
    Test if a Gemini API key is valid.
    """
    if not x_gemini_api_key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="X-Gemini-Key header is required"
        )
    
    try:
        import google.generativeai as genai
        genai.configure(api_key=x_gemini_api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        # Simple test query
        response = model.generate_content("Say 'API key is valid'")
        
        if response and response.text:
            return {
                "valid": True,
                "message": "API key is valid and working"
            }
        else:
            return {
                "valid": False,
                "message": "API key responded but unexpected format"
            }
    except Exception as e:
        logger.error(f"API key test failed: {str(e)}")
        return {
            "valid": False,
            "message": f"Invalid API key: {str(e)}"
        }
