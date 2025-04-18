import network
import socket
import time
import machine
import json
import re
import sys
import os


from api_server import APIRouter, APIServer
from manual_funcs import read_help_manual

SSID = "The Night Action"
PASSWORD = "CAKEANDBOOKS"

module_name = "online_posted_funcs"

# Connect to Wi-Fi
wlan = network.WLAN(network.STA_IF)
wlan.active(True)
wlan.connect(SSID, PASSWORD)

while not wlan.isconnected():
    time.sleep(1)

print("Connected, IP:", wlan.ifconfig()[0])

# Create server instance
server = APIServer(port=8000)

# Define testing routes with parameters
server.router.get("/api/user/:id/order/:d/:io", lambda id,d,io : {"user_id": id,"hg":d,"ii":io})
server.router.post("/api/data/:t", lambda data, t: {"received": data["score"], "type": t})

## main routes
server.router.get("/api/help", lambda: read_help_manual())
server.router.get("/api/listroutes",lambda: server.router.list_routes())

server.router.get("/api/removeroute/method/:m/route/:r", lambda m,r: remove_route(m,r))

server.router.post("/api/addapi/method/:method/route/:route/handler/:handler", 
    lambda data, method, route, handler: add_api(method, route, handler, data.get("code", "def temp(): pass"))
)
'''
curl -X POST http://192.168.0.192/api/addapi/method/GET/route/_api_greet/handler/greet \
     -d '{"code": "def greet(name): return f\"Hello, {name}!\""}'
curl -X GET http://192.168.0.192/api/greet/John
'''


def remove_route(m,r):
    formatted_route = r.replace("_", "/")  # Convert `_` to `/`
    formatted_route = formatted_route.replace("-", ":")  # Convert `_` to `/`
    server.router.remove_route(m, formatted_route)
    # /api/removeroute/method/GET/route/_api_newroute_sth

dynamic_functions = {}

def add_api(method, route, handler_name, code):
    """Registers a new API route by dynamically defining a function."""
    local_scope = {}
    global_scope = globals()
    # print(global_scope)
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

    return {"message": f"{method.upper()} API '{formatted_route}' added with handler '{handler_name}'"}




# def read(id, pp):
#     """Simulates reading data based on API parameters."""
#     return {"message": f"Read function called with id={id}, pp={pp}"}

# Run server
if __name__ == "__main__":
    server.start()

