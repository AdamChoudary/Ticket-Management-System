import asyncio
import websockets
import json

async def hello():
    uri = "ws://127.0.0.1:8000/api/ws/tickets"
    try:
        async with websockets.connect(uri) as websocket:
            print("Connected to WebSocket")
            while True:
                try:
                    message = await asyncio.wait_for(websocket.recv(), timeout=20)
                    print(f"Received: {message}")
                    data = json.loads(message)
                    if data.get("type") == "status_update" and data["ticket"].get("status") == "completed":
                        print("Ticket completed! Test Success.")
                        break
                except asyncio.TimeoutError:
                    print("Timeout waiting for message")
                    break
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(hello())
