"""
Database connection and session management using async SQLAlchemy.

This module provides:
- Async database engine with connection pooling
- Session factory for dependency injection
- Database initialization helpers
"""

from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from .config import settings

# Create async engine with connection pooling
# pool_pre_ping ensures connections are validated before use
engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,  # Log SQL queries in debug mode
    pool_pre_ping=True,   # Validate connections before using them
    pool_size=10,         # Number of connections to maintain
    max_overflow=20,      # Additional connections allowed under load
)

# Session factory for creating database sessions
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,  # Keep objects usable after commit
    autocommit=False,
    autoflush=False,
)

# Base class for all ORM models
Base = declarative_base()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency injection helper for FastAPI routes.
    
    Yields an async database session and ensures proper cleanup.
    
    Usage:
        @app.get("/tickets")
        async def get_tickets(db: AsyncSession = Depends(get_db)):
            result = await db.execute(select(Ticket))
            return result.scalars().all()
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    """
    Initialize database by creating all tables.
    
    Note: In production, use Alembic migrations instead.
    This is useful for local development and testing.
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def close_db():
    """Close database connections gracefully on shutdown."""
    await engine.dispose()
