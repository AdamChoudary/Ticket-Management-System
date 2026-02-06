"""
Rate Limiting Configuration for Production Security.

Uses SlowAPI with Redis backend to prevent abuse.
"""

from slowapi import Limiter
from slowapi.util import get_remote_address

def get_limiter():
    """
    Create and configure rate limiter instance.
    
    Uses Redis for distributed rate limiting across multiple workers.
    """
    limiter = Limiter(
        key_func=get_remote_address,
        default_limits=["100/hour"],  # Global default
        storage_uri="redis://redis:6379/1"  # Redis DB 1 (separate from Celery)
    )
    return limiter
