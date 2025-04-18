import network
import socket
import time
import machine
import json
import re
import sys

SSID = "The Night Action"
PASSWORD = "EX-NIGHT AGENT"

# Connect to Wi-Fi
wlan = network.WLAN(network.STA_IF)
wlan.active(True)
wlan.connect(SSID, PASSWORD)

while not wlan.isconnected():
    time.sleep(1)

print("Connected, IP:", wlan.ifconfig()[0])



class APIRouter:
    """Express.js-like API router for managing routes with parameters."""
    def __init__(self):
        self.routes = {"GET": {}, "POST": {}}
    
    def get(self, path, handler):
        """Registers a GET route with optional parameters."""
        self.routes["GET"][path] = handler
    
    def post(self, path, handler):
        """Registers a POST route with optional parameters."""
        self.routes["POST"][path] = handler
    
    def handle_request(self, method, path, body):
        """Handles incoming requests and delegates to registered handlers."""
        try:
            for route, handler in self.routes.get(method, {}).items():
                match = self.match_route(route, path)
                if match is not None:
                    params = match if isinstance(match, dict) else {}
                    if method == "POST":
                        try:
                            data = json.loads(body) if body else {}
                            response_data = handler(data, **params)
                        except json.JSONDecodeError:
                            return self.format_response(400, {"error": "Invalid JSON"})
                    else:
                        response_data = handler(**params)
                    return self.format_response(200, response_data)
            return self.format_response(404, {"error": "Route Not Found"})
        except Exception as e:
            sys.print_exception(e)
            return self.format_response(500, {"error": str(e)})
    
    @staticmethod
    def match_route(route, path):
        """Matches dynamic routes using MicroPython-compatible regex."""
        route_parts = route.split("/")  # Split by '/'
        path_parts = path.split("/")
        
        if len(route_parts) != len(path_parts):
            return None  # Ensure both have the same number of segments

        params = {}
        for route_part, path_part in zip(route_parts, path_parts):
            if route_part.startswith(":"):  # Dynamic parameter
                param_name = route_part[1:]  # Remove ':'
                params[param_name] = path_part  # Store value
            elif route_part != path_part:
                return None  # Mismatch in static segments

        return params
    
    @staticmethod
    def format_response(status_code, data):
        """Formats the response in HTTP format."""
        response_body = json.dumps(data)
        return f"HTTP/1.1 {status_code} OK\r\nContent-Type: application/json\r\n\r\n{response_body}"


class APIServer:
    """A socket-based API server similar to Express.js."""
    def __init__(self, host="0.0.0.0", port=8000):
        self.host = host
        self.port = port
        self.server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.server_socket.bind((self.host, self.port))
        self.server_socket.listen(5)
        self.router = APIRouter()
        print(f"Server running on http://{self.host}:{self.port}")
    
    def start(self):
        
        """Starts the API server loop."""
        try:
            while True:
                conn, addr = self.server_socket.accept()
                request = conn.recv(1024).decode()
                if request:
                    response = self.process_request(request)
                    conn.sendall(response.encode())
                conn.close()
        except KeyboardInterrupt:
            print("\nShutting down server gracefully...")
            self.server_socket.close()
    
    def process_request(self, request):
        """Parses the HTTP request and delegates to the router."""
        try:
            request_lines = request.split("\r\n")
            method, path, _ = request_lines[0].split(" ")
            body = request.split("\r\n\r\n")[1] if "\r\n\r\n" in request else ""
            return self.router.handle_request(method, path, body)
        except Exception as e:
            sys.print_exception(e)
            return f"HTTP/1.1 500 Internal Server Error\r\nContent-Type: text/plain\r\n\r\n{str(e)}"



# Create server instance
server = APIServer(port=8000)

# Define routes with parameters
server.router.get("/api/user/:id/order/:d/pic/:io", lambda id,d,io : {"user_id": id,"hg":d,"ii":io})
server.router.post("/api/data/:type", lambda data, type: {"received": data["score"], "type": type})

server.router.get("/api/help", lambda: read_help_manual())

def read_help_manual():
    """Reads API documentation from an external file."""
    try:
        to_ret = ""
        with open("res/api_help.json", "r") as f:
#             print(f.read())
            to_ret = f.read()
        return to_ret
    except Exception as e:
        return {"error": "API manual not found."}

# Run server
if __name__ == "__main__":
    server.start()
