#!/usr/bin/env python3
"""
WebSocket Connection Test

Tests direct WebSocket connection to diagnose 403 Forbidden error.
"""

import asyncio
import websockets

async def test_websocket():
    uri = "ws://localhost:8000/ws/tickets"
    
    try:
        print(f"🔌 Connecting to {uri}...")
        async with websockets.connect(uri) as websocket:
            print("✅ WebSocket connected successfully!")
            
            # Wait for a message
            try:
                message = await asyncio.wait_for(websocket.recv(), timeout=5)
                print(f"📥 Received: {message}")
            except asyncio.TimeoutError:
                print("⏱️  No message received in 5s (this is normal if no tickets are being processed)")
                
    except websockets.exceptions.InvalidStatusCode as e:
        print(f"❌ Connection failed with status code: {e.status_code}")
        print(f"   Headers: {e.headers}")
    except Exception as e:
        print(f"❌ Connection error: {type(e).__name__}: {e}")

if __name__ == "__main__":
    asyncio.run(test_websocket())
