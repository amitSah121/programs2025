import network
import socket
import time
import machine
import json
import re
import sys
import os



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
        
    def list_routes(self):
        """Returns a dictionary of all registered routes."""
        return {
            "GET": list(self.routes["GET"].keys()),
            "POST": list(self.routes["POST"].keys())
        }
        

    def remove_route(self, method, path):
        """Removes a registered route."""
        if method in self.routes and path in self.routes[method]:
            del self.routes[method][path]
            return {"message": f"Route {method} {path} removed"}
        return {"error": f"Route {method} {path} not found"}
    
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
                        except e:
                            return self.format_response(400, {"error": e})
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
    
#     @staticmethod
#     def format_response(status_code, data):
#         """Formats the response in HTTP format with CORS headers."""
#         response = {
#             "status": status_code,
#             "data": data
#         }
#         headers = "HTTP/1.1 {} OK\r\nContent-Type: application/json\r\nAccess-Control-Allow-Origin: *\r\nAccess-Control-Allow-Methods: GET, POST, OPTIONS\r\nAccess-Control-Allow-Headers: Content-Type\r\n\r\n"
#         return headers.format(status_code) + json.dumps(response)

    @staticmethod
    def format_response(status_code, data):
        """Formats the response in HTTP format with CORS headers."""
        response_data = {
            "status": status_code,
            "data": data
        }
        response_body = json.dumps(response_data)

        response_headers = (
            f"HTTP/1.1 {status_code} OK\r\n"
            "Content-Type: application/json\r\n"
            "Access-Control-Allow-Origin: *\r\n"
            "Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n"
            "Access-Control-Allow-Headers: Content-Type\r\n"
            "\r\n"  # End of headers
        )
        return response_headers + response_body


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



