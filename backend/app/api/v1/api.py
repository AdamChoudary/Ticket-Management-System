from fastapi import APIRouter
from .endpoints import tickets, websockets

api_router = APIRouter()

# Mount tickets router
api_router.include_router(tickets.router, tags=["Tickets"])

# Mount WebSockets router
api_router.include_router(websockets.router, tags=["WebSockets"])
