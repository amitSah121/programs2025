import uasyncio as asyncio

# Background task (like OS scheduler or monitoring)
async def background_task():
    count = 0
    while True:
        print("Background task running:", count)
        count += 1
        await asyncio.sleep(2)

# HTTP handler for incoming connections
async def handle_client(reader, writer):
    try:
        request = await reader.read(1024)
        request = request.decode()

        print("Received request:")
        print(request)

        response = (
            "HTTP/1.1 200 OK\r\n"
            "Content-Type: text/plain\r\n"
            "Access-Control-Allow-Origin: *\r\n"
            "Connection: close\r\n"
            "\r\n"
            "Hello from Pico W Async Server!\n"
        )

        await writer.awrite(response)
    except Exception as e:
        print("Error:", e)
    finally:
        await writer.aclose()

# Start the async TCP server
async def start_server():
    server = await asyncio.start_server(handle_client, "0.0.0.0", 8000)
    print("Server listening on port 8000")

# Main function
async def main():
    asyncio.create_task(background_task())
    await start_server()

    while True:
        await asyncio.sleep(1)

# Run it
asyncio.run(main())

