import network
import socket
import time
import machine
import json
import re
import sys
import os


from api_server import APIRouter, APIServer
from manual_funcs import read_help_manual, read_file, write_file, append_file

SSID = "moto"
PASSWORD = "kiran@123"


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
    print(wlan.scan())
    time.sleep(1)

print("Connected, IP:", wlan.ifconfig()[0])


# motor codes

# Motor and distance parameters
steps_per_revolution = 200         # Number of steps per motor revolution
pitch_mm_per_rev = 2.0             # Linear distance per revolution (in mm)
distance_per_step = pitch_mm_per_rev / steps_per_revolution

# Define pins
motor1_direction_pin = Pin(20, Pin.OUT)
motor1_pulse_pin = Pin(21, Pin.OUT)

motor2_direction_pin = Pin(18, Pin.OUT)
motor2_pulse_pin = Pin(19, Pin.OUT)

motor3_direction_pin = Pin(16, Pin.OUT)
motor3_pulse_pin = Pin(17, Pin.OUT)

# Define directions
cw_direction = 0
ccw_direction = 1

# Set initial direction
motor1_direction_pin.value(cw_direction)
motor2_direction_pin.value(cw_direction)
motor3_direction_pin.value(cw_direction)

# Distance counter
linear_distance = 0.0

speed = 1000.0
factor = 1/1000

def step_motor(direction,x,y,z):
    motor1_direction_pin.value(direction) # cw_dir, ccw_dir
    motor2_direction_pin.value(direction) # cw_dir, ccw_dir
    motor3_direction_pin.value(direction)
    
    for _ in range(steps_per_revolution):  # Full rotation
        if x:
            motor1_pulse_pin.value(1) # x-axis
        if z:
            motor2_pulse_pin.value(1) # z -axis
        if z:    
            motor3_pulse_pin.value(1) # y-axis
        sleep_us(int(1000.0*factor*speed))  # 1 ms pulse
        if x:
            motor1_pulse_pin.value(0) # x-axis
        if z:
            motor2_pulse_pin.value(0) # z -axis
        if z:    
            motor3_pulse_pin.value(0) # y-axis
        sleep_us(int(500.0*factor*speed))   # 0.5 ms delay
#         linear_distance += distance_per_step  # Increment distance

## total = 161 mm given 1mm travel distance in width
## total = 235 mm given 1mm travel distance in length
## total = 110 mm given travel distance in z-axis ## 90 mm as of now

total_times = 4
sleep_time = 0.2

def run_motor(total_times, sleep_time):
    for i in range(total_times):
        print('Direction CW')
        sleep(sleep_time)

        step_motor(cw_direction, True, True, True)
    clean_up()


def clean_up():
    motor1_pulse_pin.value(0)
    motor2_pulse_pin.value(0)
    motor3_pulse_pin.value(0)
    motor1_direction_pin.value(0)
    motor2_direction_pin.value(0)
    motor3_direction_pin.value(0)

# run_motor(total_times, sleep_time)
# clean_up()



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

server.router.get("/api/run_motor/:t/:s",lambda t,s: run_motor(int(t),float(s)))
'''
/api/runmotor/total_times = 4/sleep_time = 0.2
'''

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


# Run server
if __name__ == "__main__":
    server.start()

