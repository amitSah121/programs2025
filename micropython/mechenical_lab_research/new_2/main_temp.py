import network
import socket
import time
import machine
import json
import re
import sys
import os
import _thread
import uasyncio as asyncio

# API Router and Server classes with improvements from previous solution
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
                        except Exception as e:
                            sys.print_exception(e)
                            return self.format_response(400, {"error": str(e)})
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
            f"Content-Length: {len(response_body)}\r\n"  # Added content length
            "\r\n"  # End of headers
        )
        return response_headers + response_body

class APIServer:
    """An async socket-based API server."""
    def __init__(self, host="0.0.0.0", port=8000):
        self.host = host
        self.port = port
        self.router = APIRouter()
        self.response_last = None
        self.running = True
        print(f"Server initialized on http://{self.host}:{self.port}")

    async def handle_client(self, client_socket, addr):
        """Handles client requests asynchronously."""
        try:
            request = await self.read_request(client_socket)
            if not request:
                return
                
            # Parse the request
            request_lines = request.split('\r\n')
            request_line = request_lines[0]
            
            try:
                method, path, _ = request_line.split(" ")
            except ValueError:
                print(f"Invalid request line: {request_line}")
                client_socket.send(b"HTTP/1.1 400 Bad Request\r\nContent-Type: text/plain\r\n\r\nBad request format")
                return
                
            # Extract body if present
            body = ""
            if "\r\n\r\n" in request:
                body = request.split("\r\n\r\n")[1]

            print(f"Processing {method} {path}")
            response = self.process_request(method, path, body)
            
            # Store last response for debugging
            self.response_last = {
                "method": method,
                "path": path,
                "body": body,
                "response": response[:200] + "..." if len(response) > 200 else response  # Truncate long responses
            }
            
            await self.send_response(client_socket, response)
            
        except Exception as e:
            sys.print_exception(e)
            error_response = "HTTP/1.1 500 Internal Server Error\r\nContent-Type: text/plain\r\n\r\nError processing request."
            await self.send_response(client_socket, error_response)
        finally:
            client_socket.close()

    async def read_request(self, client_socket):
        """Read the complete HTTP request."""
        try:
            # Set non-blocking mode
            client_socket.setblocking(False)
            
            request = b""
            start_time = time.time()
            timeout = 5  # 5 seconds timeout
            
            while True:
                if time.time() - start_time > timeout:
                    print("Request timeout")
                    return None
                    
                try:
                    chunk = client_socket.recv(1024)
                    if not chunk:
                        break
                        
                    request += chunk
                    
                    # Check if we've received the complete request
                    if b"\r\n\r\n" in request:
                        # For requests with body, check Content-Length
                        if b"Content-Length:" in request:
                            header_end = request.find(b"\r\n\r\n") + 4
                            headers = request[:header_end].decode('utf-8', 'ignore')
                            body = request[header_end:]
                            
                            # Extract Content-Length
                            content_length_match = re.search(r"Content-Length: (\d+)", headers)
                            if content_length_match:
                                content_length = int(content_length_match.group(1))
                                
                                # Continue reading if we haven't received the complete body
                                if len(body) < content_length:
                                    continue
                        break
                        
                except OSError as e:
                    # Non-blocking socket may raise EAGAIN/EWOULDBLOCK
                    await asyncio.sleep(0.01)
                    continue
                
            return request.decode('utf-8', 'ignore')
        except Exception as e:
            sys.print_exception(e)
            return None
            
    async def send_response(self, client_socket, response):
        """Send HTTP response to client."""
        try:
            # Reset to blocking mode for sending
            client_socket.setblocking(True)
            client_socket.send(response.encode())
        except Exception as e:
            sys.print_exception(e)

    def process_request(self, method, path, body):
        """Parses the HTTP request and delegates to the router."""
        try:
            return self.router.handle_request(method, path, body)
        except Exception as e:
            sys.print_exception(e)
            return f"HTTP/1.1 500 Internal Server Error\r\nContent-Type: text/plain\r\n\r\n{str(e)}"

    async def start(self):
        """Start the server using asyncio."""
        server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        server_socket.bind((self.host, self.port))
        server_socket.listen(5)
        server_socket.setblocking(False)

        print(f"Server running on http://{self.host}:{self.port}")

        while self.running:
            try:
                client_socket, addr = await self.wait_for_connection(server_socket)
                if client_socket:
                    print(f"Connection from {addr}")
                    asyncio.create_task(self.handle_client(client_socket, addr))
            except Exception as e:
                sys.print_exception(e)
                await asyncio.sleep(0.1)
                
    async def wait_for_connection(self, socket):
        """Wait for a connection with timeout."""
        while self.running:
            try:
                return await asyncio.wait_for(asyncio.sock_accept(socket), 1)
            except asyncio.TimeoutError:
                # Check if server is still running every second
                continue
            except Exception as e:
                sys.print_exception(e)
                await asyncio.sleep(1)
                return None, None
                
    def stop(self):
        """Stop the server."""
        self.running = False
        print("Server stopping...")

# Your advanced Core1Scheduler
class Core1Scheduler:
    def __init__(self):
        self.leave = False
        self.tasks = {}         # task_id: (task_generator_func, args, kwargs)
        self.priorities = {}    # task_id: priority
        self._next_id = 0

    def _generate_task_id(self):
        task_id = self._next_id
        self._next_id += 1
        return task_id

    def add_task(self, task_gen_func, *args, priority=1, **kwargs):
        task_id = self._generate_task_id()
        self.tasks[task_id] = (task_gen_func, args, kwargs)
        self.priorities[task_id] = priority
        return {"task_id": task_id, "message": f"Task {task_gen_func.__name__} added with priority {priority}"}
    
    def list_tasks(self):
        """List all scheduled tasks."""
        task_list = []
        for task_id, (func, args, kwargs) in self.tasks.items():
            task_list.append({
                "id": task_id,
                "name": func.__name__,
                "priority": self.priorities[task_id],
                "args": str(args),
                "kwargs": str(kwargs)
            })
        return {"tasks": task_list}
    
    def remove_task(self, task_id):
        """Remove a task by ID."""
        task_id = int(task_id)
        if task_id in self.tasks:
            func_name = self.tasks[task_id][0].__name__
            del self.tasks[task_id]
            del self.priorities[task_id]
            return {"message": f"Task {task_id} ({func_name}) removed"}
        return {"error": f"Task {task_id} not found"}
    
    def soft_sleep(self, ms):
        start = time.ticks_ms()
        while time.ticks_diff(time.ticks_ms(), start) < ms:
            pass

    def run(self):
        print("Core 1 scheduler started")
        while not self.leave:
            sorted_tasks = sorted(self.priorities.items(), key=lambda item: -item[1])
            for task_id, _ in sorted_tasks:
                if task_id not in self.tasks:
                    continue

                task_func, args, kwargs = self.tasks[task_id]
                try:
                    repeat = next(task_func(*args, **kwargs))
                    if not repeat:
                        del self.tasks[task_id]
                        del self.priorities[task_id]
                except StopIteration:
                    # Task completed naturally
                    del self.tasks[task_id]
                    del self.priorities[task_id]
                except Exception as e:
                    sys.print_exception(e)
                    print(f"Error in task {task_id}: {str(e)}")
                    # Keep task running despite errors
        print("Core 1 scheduler stopped")

# Helper functions from your code
def soft_sleep(ms):
    start = time.ticks_ms()
    while time.ticks_diff(time.ticks_ms(), start) < ms:
        yield False
    yield True

# Import your manual functions or define them here
def read_help_manual():
    try:
        with open("help_manual.txt", "r") as f:
            return {"content": f.read()}
    except Exception as e:
        return {"error": str(e), "message": "Help manual not found"}

def read_file(name):
    try:
        with open(name, "r") as f:
            return {"content": f.read()}
    except Exception as e:
        return {"error": str(e)}

def write_file(data, name):
    try:
        content = data.get("content", "")
        with open(name, "w") as f:
            f.write(content)
        return {"message": f"File {name} written successfully"}
    except Exception as e:
        return {"error": str(e)}

def append_file(data, name):
    try:
        content = data.get("content", "")
        with open(name, "a") as f:
            f.write(content)
        return {"message": f"Content appended to {name} successfully"}
    except Exception as e:
        return {"error": str(e)}

# Initialize system
SSID = "The Night Action"  # "moto"
PASSWORD = "CAKEANDBOOKS"  # "kiran@123"

PORTS = [8000, 8080, 9000, 10000]
CONFIG_FILE = "config.json"  # Store registered APIs
api_registry = []  # Global list to track added APIs
dynamic_functions = {}
stop_funcs = False

# Dynamic route management functions
def save_api_registry():
    """Saves the API registry to a JSON file."""
    with open(CONFIG_FILE, "w") as f:
        json.dump(api_registry, f)

def load_api_registry():
    """Loads the API registry from a JSON file and registers them dynamically."""
    global api_registry
    try:
        with open(CONFIG_FILE, "r") as f:
            api_registry = json.load(f)
        
        for entry in api_registry:
            add_api(entry["method"], entry["route"], entry["handler"], entry["code"], save=False)
    except Exception as e:
        print(f"Error loading API registry: {e}")

def get_config():
    """Reads and returns the contents of config.json."""
    try:
        with open("config.json", "r") as f:
            return json.load(f)
    except Exception as e:
        return {"error": str(e)}

def remove_route(m, r):
    formatted_route = r.replace("_", "/")  # Convert `_` to `/`
    formatted_route = formatted_route.replace("-", ":")  # Convert `-` to `:`
    server.router.remove_route(m, formatted_route)
    global api_registry
    api_registry = [api for api in api_registry if not (api["method"] == m and api["route"] == formatted_route)]
    save_api_registry()
    return {"message": f"Route {m} {formatted_route} removed"}

def add_api(method, route, handler_name, code, save=True):
    """Registers a new API route by dynamically defining a function."""
    local_scope = {}
    global_scope = globals()
    try:
        exec(code, global_scope, local_scope)  # Execute function definition
        
        if handler_name not in local_scope:
            return {"error": f"Handler '{handler_name}' not found in provided code"}
        
        # Store function in memory
        dynamic_functions[handler_name] = local_scope[handler_name]
        
        formatted_route = route.replace("_", "/")  # Convert `_` to `/`
        formatted_route = formatted_route.replace("-", ":")  # Convert `-` to `:`

        # Register route dynamically
        if method.upper() == "GET":
            server.router.get(formatted_route, lambda **args: dynamic_functions[handler_name](**args))
        elif method.upper() == "POST":
            server.router.post(formatted_route, lambda data, **args: dynamic_functions[handler_name](data, **args))
        else:
            return {"error": f"Method '{method}' not supported"}
        
        if save:
            index = -1
            for k in range(len(api_registry)):
                if api_registry[k]["route"] == formatted_route:
                    index = k
                    break
            if index != -1:
                api_registry.pop(index)
                    
            api_registry.append({"route": formatted_route, "method": method.upper(), "handler": handler_name, "code": code})

            save_api_registry()

        return {"message": f"{method.upper()} API '{formatted_route}' added with handler '{handler_name}'"}
    except Exception as e:
        sys.print_exception(e)
        return {"error": f"Failed to add API: {str(e)}"}

# Example task functions
def hello(name="world", k=1):
    print(f"Hello task: {name} (k={k})")
    time.sleep(k)
    yield True

def fello(name="fellow", k=1):
    print(f"Fello task: {name} (k={k})")
    time.sleep(k)
    yield True

def stopall(scheduler):
    """Stop all running tasks and the server."""
    if scheduler is not None:
        scheduler.leave = True
    server.stop()
    return {"message": "All tasks and server stopping..."}

# Connect to Wi-Fi function
def connect_wifi(ssid=SSID, password=PASSWORD):
    """Connect to WiFi with the given credentials."""
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    
    if wlan.isconnected():
        return {"ip": wlan.ifconfig()[0], "status": "already_connected"}
    
    print(f"Connecting to {ssid}...")
    wlan.connect(ssid, password)
    
    # Wait for connection with timeout
    max_wait = 20
    while max_wait > 0:
        if wlan.isconnected():
            ip = wlan.ifconfig()[0]
            print(f"Connected, IP: {ip}")
            return {"ip": ip, "status": "connected"}
        max_wait -= 1
        time.sleep(1)
        print("Connecting...")
    
    print("Failed to connect")
    return {"status": "failed", "error": "Connection timeout"}

# Run server
if __name__ == "__main__":
    # Connect to WiFi
    connection = connect_wifi()
    print(f"WiFi connection: {connection}")
    
    # Create server instance
    server = None
    for port in PORTS:
        try:
            server = APIServer(port=port)
            break
        except OSError:
            print(f"Port {port} unavailable, trying next...")

    if server is None:
        raise Exception("No available ports. Server could not start.")
    
    # Define core routes
    server.router.get("/", lambda: {"message": "API Server is running", "ip": network.WLAN(network.STA_IF).ifconfig()[0]})
    server.router.get("/api/config", lambda: get_config())
    server.router.get("/api/postresponse", lambda: server.response_last)
    server.router.get("/api/help", lambda: read_help_manual())
    server.router.get("/api/listroutes", lambda: server.router.list_routes())

    server.router.get("/api/readfile/:name", lambda name: read_file(name))
    server.router.post("/api/writefile/:name", lambda data, name: write_file(data, name))
    server.router.post("/api/appendfile/:name", lambda data, name: append_file(data, name))
    
    server.router.get("/api/removeroute/method/:m/route/:r", lambda m, r: remove_route(m, r))
    
    server.router.post("/api/addapi/method/:method/route/:route/handler/:handler", 
        lambda data, method, route, handler: add_api(method, route, handler, data.get("code", "def temp(): pass"))
    )
    
    # Start core 1 scheduler
    core1_sched = Core1Scheduler()
    
    # Add task management routes
    server.router.get("/api/tasks", lambda: core1_sched.list_tasks())
    server.router.get("/api/tasks/remove/:id", lambda id: core1_sched.remove_task(id))
    server.router.post("/api/tasks", lambda data: core1_sched.add_task(
        globals()[data.get("func")], 
        *data.get("args", []), 
        priority=data.get("priority", 1), 
        **data.get("kwargs", {})
    ))
    
    # Add example tasks
    core1_sched.add_task(hello, "Hello World", priority=5, k=2)
    core1_sched.add_task(fello, "Fellow World", priority=5, k=5)
    
    # Start core 1 scheduler in a separate thread
    _thread.start_new_thread(core1_sched.run, ())
    
    # Load any previously registered APIs
    load_api_registry()
    
    # Add server stop route
    server.router.get("/api/stopall", lambda: stopall(core1_sched))
    
    # Start the server
    print("Starting API server...")
    try:
        asyncio.run(server.start())
    except KeyboardInterrupt:
        print("Server stopped by user")
    except Exception as e:
        sys.print_exception(e)
        print("Server crashed, attempting to restart...")
        # You could implement auto-restart logic here
