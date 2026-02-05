"""
Celery worker tasks for asynchronous ticket processing.

WHY CELERY?
-----------
Celery decouples the API from slow operations (like AI calls). This architecture provides:

1. **Non-blocking API**: FastAPI responds instantly (< 100ms) regardless of processing time
2. **Scalability**: Can run multiple workers to handle increased load
3. **Reliability**: Tasks are persisted in Redis and retried on failure
4. **Fault tolerance**: If a worker crashes, tasks are redistributed
5. **Monitoring**: Built-in tools (Flower, logs) for task tracking

WORKFLOW:
---------
1. API receives POST /tickets request
2. API saves ticket to DB with status="pending"
3. API triggers this task: process_ticket.delay(ticket_id)
4. API returns 201 immediately
5. Worker picks up task from Redis queue
6. Worker processes ticket (AI analysis)
7. Worker updates DB with results
8. Frontend polls and displays updated data
"""

import asyncio
import time
from typing import Optional
from uuid import UUID
from celery import Celery
from celery.utils.log import get_task_logger
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import NullPool

from .config import settings
from .models import Ticket, TicketStatus
from .schemas import AIAnalysisResult

# Initialize Celery app
celery_app = Celery(
    "ai_support_hub",
    broker=settings.get_celery_broker_url(),
    backend=settings.get_celery_result_backend(),
)

# Celery configuration for production reliability
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,  # 5 minutes max per task
    task_soft_time_limit=240,  # Soft limit for graceful shutdown
    task_acks_late=True,  # Acknowledge after completion (not on start)
    worker_prefetch_multiplier=1,  # Take one task at a time
    task_reject_on_worker_lost=True,  # Re-queue if worker crashes
)

# Logger for task execution
logger = get_task_logger(__name__)

# Create async engine for worker (separate from API)
# CRITICAL: Use NullPool because Celery workers run synchronous tasks that
# create a new asyncio loop for each execution. Standard pooling tries to
# reuse connections attached to closed loops, causing "Future attached to different loop" errors.
worker_engine = create_async_engine(
    settings.database_url,
    echo=False,
    pool_pre_ping=True,
    poolclass=NullPool,
)

WorkerSessionLocal = async_sessionmaker(
    worker_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


from .services.ai_service import ai_service

async def process_ticket_async(ticket_id: UUID) -> dict:
    """
    Async function to process a ticket with AI analysis.
    
    This is the core business logic:
    1. Fetch ticket from DB
    2. Update status to "processing"
    3. Call AI for analysis (AI Service handles LLM vs Mock)
    4. Validate AI response
    5. Update ticket with results
    6. Set status to "completed"
    
    Args:
        ticket_id: UUID of the ticket to process
        
    Returns:
        dict: Result summary with success status and processing time
    """
    start_time = time.time()
    
    async with WorkerSessionLocal() as db:
        try:
            # Step 1: Fetch ticket from database
            result = await db.execute(select(Ticket).where(Ticket.id == ticket_id))
            ticket = result.scalar_one_or_none()
            
            if not ticket:
                logger.error(f"Ticket {ticket_id} not found in database")
                return {
                    "success": False,
                    "message": f"Ticket {ticket_id} not found",
                    "processing_time_seconds": time.time() - start_time
                }
            
            logger.info(f"Processing ticket {ticket_id}: {ticket.request_content[:50]}...")
            
            # Step 2: Update status to "processing"
            await db.execute(
                update(Ticket)
                .where(Ticket.id == ticket_id)
                .values(status=TicketStatus.PROCESSING)
            )
            await db.commit()
            
            # Step 3: Call AI Service (Handles LLM Logic + Fallback)
            try:
                ai_result = await ai_service.analyze_ticket(ticket.request_content)
                logger.info(f"AI analysis completed for ticket {ticket_id}: {ai_result.category}, {ai_result.urgency}")
            except Exception as ai_error:
                logger.error(f"AI Service Critical Failure for ticket {ticket_id}: {ai_error}")
                
                # Update status to failed
                await db.execute(
                    update(Ticket)
                    .where(Ticket.id == ticket_id)
                    .values(status=TicketStatus.FAILED)
                )
                await db.commit()
                
                return {
                    "success": False,
                    "message": f"AI analysis critical failure: {str(ai_error)}",
                    "processing_time_seconds": time.time() - start_time
                }
            
            # Step 4: Update ticket with AI results
            await db.execute(
                update(Ticket)
                .where(Ticket.id == ticket_id)
                .values(
                    status=TicketStatus.COMPLETED,
                    urgency=ai_result.urgency,
                    sentiment_score=ai_result.sentiment_score,
                    category=ai_result.category,
                    draft_response=ai_result.draft_response
                )
            )
            await db.commit()
            
            processing_time = time.time() - start_time
            logger.info(f"Ticket {ticket_id} completed in {processing_time:.2f}s")
            
            return {
                "success": True,
                "message": f"Ticket {ticket_id} processed successfully",
                "processing_time_seconds": processing_time
            }
            
        except Exception as e:
            logger.error(f"Unexpected error processing ticket {ticket_id}: {e}", exc_info=True)
            
            # Attempt to mark as failed
            try:
                await db.execute(
                    update(Ticket)
                    .where(Ticket.id == ticket_id)
                    .values(status=TicketStatus.FAILED)
                )
                await db.commit()
            except:
                pass  # If this fails, we've already logged the main error
            
            return {
                "success": False,
                "message": f"Error: {str(e)}",
                "processing_time_seconds": time.time() - start_time
            }


@celery_app.task(
    bind=True,
    name="process_ticket",
    max_retries=3,
    default_retry_delay=60,  # Retry after 60 seconds
)
def process_ticket(self, ticket_id: str) -> dict:
    """
    Celery task to process a support ticket.
    
    This task is triggered by the API when a new ticket is created.
    It runs asynchronously in a worker process, separate from the API.
    
    Args:
        ticket_id: UUID string of the ticket to process
        
    Returns:
        dict: Processing result with success status
        
    Retry Policy:
        - Max 3 retries
        - 60 second delay between retries
        - Exponential backoff
    """
    try:
        # Convert string to UUID
        ticket_uuid = UUID(ticket_id)
        
        # Run async processing
        # We utilize asyncio.run() which correctly creates and closes a new event loop
        # Combined with NullPool, this ensures thread/loop safety
        return asyncio.run(process_ticket_async(ticket_uuid))
            
    except ValueError as e:
        logger.error(f"Invalid ticket ID format: {ticket_id}")
        return {
            "success": False,
            "message": f"Invalid ticket ID: {str(e)}"
        }
    except Exception as exc:
        logger.error(f"Task failed, retrying... Error: {exc}")
        # Retry the task with exponential backoff
        raise self.retry(exc=exc, countdown=min(60 * (2 ** self.request.retries), 900))
