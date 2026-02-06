import asyncio
import logging
from typing import List
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from redis.asyncio import Redis
from app.core.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)

class ConnectionManager:
    """
    Manages active WebSocket connections and broadcasts messages.
    """
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket client connected. Total: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket client disconnected. Total: {len(self.active_connections)}")

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                logger.error(f"Failed to send message: {e}")
                # Connection might be dead, safe to ignore here, disconnect handles cleanup

manager = ConnectionManager()

@router.websocket("/ws/tickets")
async def ticket_updates(websocket: WebSocket):
    """
    WebSocket endpoint for real-time ticket updates.
    
    Subscribes to Redis 'ticket_updates' channel and forwards messages to the client.
    """
    await manager.connect(websocket)
    
    redis = Redis.from_url(settings.redis_url, decode_responses=True)
    pubsub = redis.pubsub()
    
    try:
        await pubsub.subscribe("ticket_updates")
        
        # Listen for messages from Redis and forward to WebSocket
        async for message in pubsub.listen():
            if message["type"] == "message":
                await websocket.send_text(message["data"])
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await pubsub.unsubscribe("ticket_updates")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)
    finally:
        await redis.close()
