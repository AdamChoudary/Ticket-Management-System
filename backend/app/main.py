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
import logging
import sys

from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError
import redis.asyncio as aioredis
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from .core.config import settings
from .core.rate_limit import get_limiter
from .database import get_db, init_db, close_db
from .schemas import HealthCheckResponse
from .middleware import RequestLoggingMiddleware, SecurityHeadersMiddleware
from .exceptions import BaseAPIException
from .api.v1.api import api_router

# Configure logging
logging.basicConfig(
    level=logging.INFO if settings.debug else logging.WARNING,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)


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

# Initialize rate limiter
limiter = get_limiter()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configure CORS FIRST (before other middleware) for WebSocket support
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
    expose_headers=["X-Request-ID"],  # Expose request ID to frontend
)

# Add custom middleware AFTER CORS
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestLoggingMiddleware)


# Global exception handlers
@app.exception_handler(BaseAPIException)
async def api_exception_handler(request: Request, exc: BaseAPIException):
    """Handle custom API exceptions."""
    request_id = getattr(request.state, "request_id", "unknown")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail,
            "error_code": exc.error_code,
            "request_id": request_id,
        },
        headers={"X-Request-ID": request_id}
    )

@app.exception_handler(SQLAlchemyError)
async def database_exception_handler(request: Request, exc: SQLAlchemyError):
    """Handle database errors."""
    request_id = getattr(request.state, "request_id", "unknown")
    logger.error(f"Database error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Database error occurred",
            "error_code": "DATABASE_ERROR",
            "request_id": request_id,
        },
        headers={"X-Request-ID": request_id}
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
# Mount API Router
# ============================================================================

app.include_router(api_router, prefix="/api")


# ============================================================================
# Root Endpoint
# ============================================================================

@app.get("/", tags=["Root"])
async def root():
    """
    API root endpoint with basic information.
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
