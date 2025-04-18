import network
import socket
import time
import machine
import json
import re
import sys
import os
import _thread


from api_server import APIRouter, APIServer
from manual_funcs import read_help_manual, read_file, write_file, append_file

SSID = "The Night Action"# "moto"
PASSWORD = "CAKEANDBOOKS"# "kiran@123"

PORTS = [8000, 8080, 9000, 10000]
CONFIG_FILE = "config.json"  # Store registered APIs
api_registry = []  # Global list to track added APIs
dynamic_functions = {}
stop_funcs = False


# Connect to Wi-Fi
wlan = network.WLAN(network.STA_IF)
wlan.active(True)
wlan.connect(SSID, PASSWORD)

while not wlan.isconnected():
    print("connecting...")
#     print(wlan.scan())
    time.sleep(1)

print("Connected, IP:", wlan.ifconfig()[0])

# Create server instance
server = None
for port in PORTS:
    try:
        server = APIServer(port=port)
        print(f"Server running on port {port}")
        break
    except OSError:
        print(f"Port {port} unavailable, trying next...")

if server is None:
    raise Exception("No available ports. Server could not start.")

# Define testing routes with parameters
# server.router.get("/api/user/:id/order/:d/:io", lambda id,d,io : {"user_id": id,"hg":d,"ii":io})
# server.router.post("/api/data/:t", lambda data, t: {"received": data["score"], "type": t})

## main routes

server.router.get("/api/config", lambda: get_config())
server.router.get("/api/postresponse", lambda: server.response_last)
server.router.get("/api/help", lambda: read_help_manual())
server.router.get("/api/listroutes",lambda: server.router.list_routes())

server.router.get("/api/readfile/:name", lambda name: read_file(name))
server.router.post("/api/writefile/:name", lambda data,name: write_file(data,name))
server.router.post("/api/appendfile/:name", lambda data,name: append_file(data,name))



server.router.get("/api/removeroute/method/:m/route/:r", lambda m,r: remove_route(m,r))

server.router.post("/api/addapi/method/:method/route/:route/handler/:handler", 
    lambda data, method, route, handler: add_api(method, route, handler, data.get("code", "def temp(): pass"))
)
'''
curl -X POST http://192.168.0.192/api/addapi/method/GET/route/_api_greet/handler/greet \
     -d '{"code": "def greet(name): return f\"Hello, {name}!\""}'
curl -X GET http://192.168.0.192/api/greet/John
'''

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


def remove_route(m,r):
    formatted_route = r.replace("_", "/")  # Convert `_` to `/`
    formatted_route = formatted_route.replace("-", ":")  # Convert `_` to `/`
    server.router.remove_route(m, formatted_route)
    # /api/removeroute/method/GET/route/_api_newroute_sth
    global api_registry
    api_registry = [api for api in api_registry if not (api["method"] == m and api["route"] == formatted_route)]
    save_api_registry()


def add_api(method, route, handler_name, code, save=True):
    """Registers a new API route by dynamically defining a function."""
    local_scope = {}
    global_scope = globals()
    exec(code, global_scope, local_scope)  # Execute function definition
    
    if handler_name not in local_scope:
        return {"error": f"Handler '{handler_name}' not found in provided code"}
    
    # Store function in memory
    dynamic_functions[handler_name] = local_scope[handler_name]
    
#     print(dynamic_functions, local_scope)
#     print("hello")
    formatted_route = route.replace("_", "/")  # Convert `_` to `/`
    formatted_route = formatted_route.replace("-", ":")  # Convert `_` to `/`

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

load_api_registry()


class Scheduler:
    def __init__(self):
        self.leave = False
        self.tasks = {}        # task_id: generator
        self.priorities = {}   # task_id: priority
        self._next_id = 0
        
    def _generate_task_id(self):
        task_id = self._next_id
        self._next_id += 1
        return task_id

    def add_task(self, task_gen_func, *args, priority=1, **kwargs):
        task_id = self._generate_task_id()
        self.tasks[task_id] = (task_gen_func, args, kwargs)
        self.priorities[task_id] = priority
        return task_id

    def run(self):
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
        return task_id
    
    def soft_sleep(self, ms):
        start = time.ticks_ms()
        while time.ticks_diff(time.ticks_ms(), start) < ms:
            pass

    def run(self):
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

def soft_sleep(ms):
    start = time.ticks_ms()
    while time.ticks_diff(time.ticks_ms(), start) < ms:
        yield False
    yield True

sleep_args = {}
def hello(name, k=1):
    global sleep_args
    if not "hello_ms" in sleep_args:
        sleep_args["hello_ms"] = soft_sleep(2000)
    n = 1
    def gen():
        nonlocal n
        if n == 2:
            yield False
        if (next(sleep_args["hello_ms"])):
            print(name, k)
            del sleep_args["hello_ms"]
            sleep_args["hello_ms"] = soft_sleep(1000)
            
        #time.sleep(1)
            n += 1
        yield True

    g = gen()        
    yield from g 


def fello(name, k=1):
    print(name, k)
    time.sleep(1)
    yield True

    
def stopall(sch, core):
    time.sleep(1)
    core.leave = True
    time.sleep(2)
    sch.leave = True
    time.sleep(1)  # Let thread print its exit
    print("Main done.")
    

# Run server
if __name__ == "__main__":
    
    # Start core 1
    core1_sched = Core1Scheduler()
    core1_sched.add_task(hello,"Helli",priority=5,k=2)
    core1_sched.add_task(fello,"felli",priority=5,k=3)
    _thread.start_new_thread(core1_sched.run, ())
    
    
        
#     # Main thread simulates exit after 5s
    time.sleep(10)
    core1_sched.leave = True
    time.sleep(1)  # Let thread print its exit
    print("Main done.")
#      
#     scheduler = Scheduler()
#     scheduler.add_task(server.start,priority=5)
#     
#     
#     server.router.get("/api/stopall",lambda: stopall(scheduler, core1_sched))
#     
#     
#     scheduler.run() 
