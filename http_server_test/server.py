import asyncio
import websockets

connected_clients = set()

async def chat_handler(websocket, path):
    connected_clients.add(websocket)
    try:
        async for message in websocket:
            for client in connected_clients:
                if client != websocket:
                    await client.send(message)
    finally:
        connected_clients.remove(websocket)

async def main():
    async with websockets.serve(chat_handler, "0.0.0.0", 8765):
        await asyncio.Future()  # Keeps the server running indefinitely

if __name__ == "__main__":
    asyncio.run(main())
