
var navObject = {
"nav":[
	{"name": "Home", "class":"w3-bar-item w3-button w3-hover-dark-gray"},
	{"name": "Api",  "class":"w3-bar-item w3-button w3-hover-dark-gray"},
	{"name": "Documentation",  "class":"w3-bar-item w3-button w3-hover-dark-gray"},
],
"api-nav":[
	{"name": "Help", "class":"w3-bar-item w3-button w3-hover-dark-gray"},
	{"name": "Testing",  "class":"w3-bar-item w3-button w3-hover-dark-gray"},
	{"name": "Apis",  "class":"w3-bar-item w3-button w3-hover-dark-gray"},
	{"name": "Editor",  "class":"w3-bar-item w3-button w3-hover-dark-gray"},
]};

var doc_contents = {};
let code = [`

function jsonToPreformattedString(jsonData) {
	return JSON.stringify(jsonData, null, 4)  // Pretty-print with 4 spaces indentation
		.replace(/</g, "&lt;")   // Escape '<' to prevent HTML injection
		.replace(/>/g, "&gt;");  // Escape '>' to prevent HTML injection
}


function getData(base,url){
	fetch(\`\${base}\${url}\`)
	.then(res => res.json())
	.then(data => {
		console.log(data); // data.data , for response
	})
	.catch(err => console.error("Error:", err));
}

1)

-- Inside js
const BASE_URL = "http://192.168.245.208:800";
const url = "/api/help"
getData(BASE_URL, url)

-- Inside curl
curl -X GET http://localhost:8000/api/help

2)

-- Inside js
const BASE_URL = "http://192.168.245.208:800";
const url = "/api/user/1"
getData(BASE_URL, url)

-- Inside curl
curl -X GET http://localhost:8000/api/user/1

note: 
There are some basic api for defined for testing
	- /api/user/:id

`,
`
// note at the moment the post request does the work on 
backend but javascript cannot able to receive the response, 
although curl can get the response
function postData(base, url, data,) {
	console.log(JSON.stringify({score: code}) ,\`\${base}\${url}\`);

	fetch(\`\${base}/\${url}\`, {
		method: "POST",
		mode: "no-cors",  // Ensure CORS is enabled
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({data})
	})
	.then(response => response.text())
	.then(data => {
		console.log("Success:", data);
	})
	.catch(error => console.error("Error:", error));
}


1)

-- Inside js
const BASE_URL = "http://192.168.245.208:800";
const url = "/api/user"
const data = "{'name':'home'}"
postData(BASE_URL, url, data)

-- Inside curl
curl -X POST http://localhost:8000/api/user -H 
	"Content-Type: application/json" -d '{"name": "home"}'

note: 
There are some basic api for defined for testing
	- /api/data/:id

`,
`
function addAPI(base,method,route,handler_func_name,code) {
	fetch(\`\${BASE_URL}/api/addapi/method/\${method}/route/\${route}/handler/\${handler_func_name}\`, {
		method: "POST",
		mode: "no-cors",  // Ensure CORS is enabled
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({ code })
	})
	.then(response => {
		console.log(response.text());
		return response.json();
	})
	.then(data => console.log("Success:", data))
	.catch(error => console.error("Error:", error));
}


1)

-- Inside js
const BASE_URL = "http://192.168.245.208:800";
const method = "GET"
const route = "_api_newget_-n" // converts to /api/newget/:n
const handler_func_name = "newgetfunc"
const code = \`
def newgetfunc(n):
	return n
\`
addAPI(BASE_URL,method, route, data);

-- Inside curl
curl -X POST http://localhost:8000/api/addapi/method/newget/handler/newgetfunc -H 
	"Content-Type: application/json" -d '{"code":"def newgetfunc():\n\treturn n"}'

note: 
A basic example to get access to global variables:
a)
_api_write
write
def write():
    globals()["total_times"] = 80
    return total_times

b)
_api_read
read
def read():
    return total_times

`,
`
function addAPI(base,method,route,handler_func_name,code) {
	fetch(\`\${BASE_URL}/api/addapi/method/\${method}/route/\${route}/handler/\${handler_func_name}\`, {
		method: "POST",
		mode: "no-cors",  // Ensure CORS is enabled
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({ code })
	})
	.then(response => {
		console.log(response.text());
		return response.json();
	})
	.then(data => console.log("Success:", data))
	.catch(error => console.error("Error:", error));
}


1)

-- Inside js
const BASE_URL = "http://192.168.245.208:800";
const method = "POST"
const route = "_api_newget_-n" // converts to /api/newget/:n
const handler_func_name = "newgetfunc"
// note only the function receives an extra variable that is "data" which is a dictionary
const code = \`
def newgetfunc(data,n):
	return n
\`
addAPI(BASE_URL,method, route, code);

-- Inside curl
curl -X POST http://localhost:8000/api/addapi/method/newget/route/_api_newget_-n/handler/newgetfunc -H 
	"Content-Type: application/json" -d '{"code":"def newgetfunc():\n\treturn n"}'


`,
`
// Remove API
function removeAPI(base,method,route) {

	fetch(\`\${base}/api/removeroute/method/\${method}/route/\${route}\`)
		.then(res => res.json())
		.then(data => alert("API Removed: " + JSON.stringify(data)))
		.catch(err => console.error("Error:", err));
}


1)

-- Inside js
const BASE_URL = "http://192.168.245.208:800";
const method = "POST"
const route = "_api_newget_-n"
removeAPI(BASE_URL,method, route);

-- Inside curl
curl -X GET http://localhost:8000/api/removeroute/method/newget/route/_api_newget_-n


`,
`
note some major:

server.router.get("/api/read_file", lambda: read_file())
server.router.get("/api/removeroute/method/:m/route/:r", lambda m,r: remove_route(m,r))

server.router.get("/api/user/:id/order/:d/:io", lambda id,d,io : {"user_id": id,"hg":d,"ii":io})

server.router.get("/api/user/:id", lambda id: {"user_id": id})
curl -X GET http://localhost:8000/api/user/123

server.router.get("/api/user/:id/order/:d/:io", lambda id,d,io : {"user_id": id,"hg":d,"ii":io})
curl -X GET http://192.168.0.192:90/api/user/1/order/2/3

server.router.get("/api/user/:id/order/:pid", lambda id,pid: {"user_id": id, "order_id": pid})
curl -X GET http://localhost:8000/api/user/123/order/456
http://192.168.0.192:8000/api/user/10/order/11/pic/12

server.router.get("/api/status", lambda: {"status": "OK"})
curl -X GET http://localhost:8000/api/status

server.router.get("/api/product/:category/:id", lambda category, id: {"category": category, "product_id": id})
curl -X GET http://localhost:8000/api/product/electronics/101

server.router.get("/api/weather/:city", lambda city: {"city": city, "forecast": "Sunny"})
curl -X GET http://localhost:8000/api/weather/NewYork

server.router.get("/api/timezone/:region/:city", lambda region, city: {"timezone": f"{region}/{city}"})
curl -X GET http://localhost:8000/api/timezone/US/NewYork

server.router.get("/api/math/add/:a/:b", lambda a, b: {"sum": int(a) + int(b)})
curl -X GET http://localhost:8000/api/math/add/10/5

server.router.get("/api/math/multiply/:x/:y", lambda x, y: {"product": int(x) * int(y)})
curl -X GET http://localhost:8000/api/math/multiply/4/6

server.router.get("/api/currency/:amount/:from/:to", lambda amount, from_, to: {"converted": float(amount) * 1.1})
curl -X GET http://localhost:8000/api/currency/100/USD/EUR

server.router.get("/api/books/:genre", lambda genre: {"genre": genre, "books": ["Book1", "Book2"]})
curl -X GET http://localhost:8000/api/books/science

server.router.get("/api/colors/:hex", lambda hex: {"hex": hex, "rgb": "#FF5733"})
curl -X GET http://localhost:8000/api/colors/FF5733

server.router.get("/api/datetime", lambda: {"date": "2025-03-11", "time": "12:00 PM"})
curl -X GET http://localhost:8000/api/datetime

server.router.get("/api/cars/:brand", lambda brand: {"brand": brand, "models": ["ModelX", "ModelY"]})
curl -X GET http://localhost:8000/api/cars/Tesla

server.router.get("/api/movies/:year", lambda year: {"year": year, "movies": ["MovieA", "MovieB"]})
curl -X GET http://localhost:8000/api/movies/2024

server.router.get("/api/planets/:name", lambda name: {"planet": name, "size": "Large"})
curl -X GET http://localhost:8000/api/planets/Mars

server.router.get("/api/stocks/:symbol", lambda symbol: {"symbol": symbol, "price": 123.45})
curl -X GET http://localhost:8000/api/stocks/AAPL

server.router.get("/api/temperature/:city", lambda city: {"city": city, "temperature": "25°C"})
curl -X GET http://localhost:8000/api/temperature/London

server.router.get("/api/zodiac/:sign", lambda sign: {"sign": sign, "fortune": "Good day ahead"})
curl -X GET http://localhost:8000/api/zodiac/Leo

server.router.get("/api/sports/:league", lambda league: {"league": league, "teams": ["TeamA", "TeamB"]})
curl -X GET http://localhost:8000/api/sports/NBA

server.router.get("/api/quotes/:author", lambda author: {"author": author, "quote": "This is a famous quote."})
curl -X GET http://localhost:8000/api/quotes/Einstein

`,
`

note some major:

server.router.post("/api/write_file", lambda data: write_file(data))

server.router.post("/api/addapi/method/:method/route/:route/handler/:handler", 
    lambda data, method, route, handler: add_api(method, route, handler, data.get("code", "def temp(): pass"))
)
curl -X POST http://192.168.0.192/api/addapi/method/GET/route/_api_greet/handler/greet \
     -d '{"code": "def greet(name): return f\"Hello, {name}!\""}'	 
curl -X GET http://192.168.0.192/api/greet/John


server.router.post("/api/data/:t", lambda data, t: {"received": data["score"], "type": t})



server.router.post("/api/data/:type", lambda data, type: {"received": data["score"], "type": type})
curl -X POST http://localhost:8000/api/data/sports -H "Content-Type: application/json" -d '{"score": 100}'

server.router.post("/api/user/create", lambda data: {"user_id": data["name"], "status": "created"})
curl -X POST http://localhost:8000/api/user/create -H "Content-Type: application/json" -d '{"name": "Alice"}'

server.router.post("/api/product/add", lambda data: {"product": data["name"], "price": data["price"]})
curl -X POST http://localhost:8000/api/product/add -H "Content-Type: application/json" -d '{"name": "Laptop", "price": 1200}'

server.router.post("/api/message/send", lambda data: {"message": data["text"], "status": "sent"})
curl -X POST http://localhost:8000/api/message/send -H "Content-Type: application/json" -d '{"text": "Hello"}'

server.router.post("/api/feedback", lambda data: {"user": data["user"], "feedback": data["comment"]})
curl -X POST http://localhost:8000/api/feedback -H "Content-Type: application/json" -d '{"user": "John", "comment": "Great app"}'

server.router.post("/api/login", lambda data: {"user": data["username"], "status": "logged in"})
curl -X POST http://localhost:8000/api/login -H "Content-Type: application/json" -d '{"username": "user1", "password": "1234"}'

server.router.post("/api/logout", lambda data: {"user": data["username"], "status": "logged out"})
curl -X POST http://localhost:8000/api/logout -H "Content-Type: application/json" -d '{"username": "user1"}'

server.router.post("/api/subscription", lambda data: {"email": data["email"], "subscribed": True})
curl -X POST http://localhost:8000/api/subscription -H "Content-Type: application/json" -d '{"email": "test@example.com"}'

server.router.post("/api/calculate/sum", lambda data: {"sum": data["a"] + data["b"]})
curl -X POST http://localhost:8000/api/calculate/sum -H "Content-Type: application/json" -d '{"a": 10, "b": 20}'

server.router.post("/api/calculate/product", lambda data: {"product": data["x"] * data["y"]})
curl -X POST http://localhost:8000/api/calculate/product -H "Content-Type: application/json" -d '{"x": 5, "y": 6}'

server.router.post("/api/set/timezone", lambda data: {"timezone": data["tz"], "status": "updated"})
curl -X POST http://localhost:8000/api/set/timezone -H "Content-Type: application/json" -d '{"tz": "EST"}'

server.router.post("/api/upload", lambda data: {"filename": data["name"], "status": "uploaded"})
curl -X POST http://localhost:8000/api/upload -H "Content-Type: application/json" -d '{"name": "file.txt"}'

server.router.post("/api/event/register", lambda data: {"user": data["name"], "event": data["event"]})
curl -X POST http://localhost:8000/api/event/register -H "Content-Type: application/json" -d '{"name": "Alice", "event": "Marathon"}'

server.router.post("/api/payment", lambda data: {"user": data["user"], "amount": data["amount"], "status": "paid"})
curl -X POST http://localhost:8000/api/payment -H "Content-Type: application/json" -d '{"user": "Alice", "amount": 100}'

server.router.post("/api/contact", lambda data: {"email": data["email"], "message": data["msg"]})
curl -X POST http://localhost:8000/api/contact -H "Content-Type: application/json" -d '{"email": "help@example.com", "msg": "Support needed"}'

`,
`

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

server.router.get("/api/run_motor/:t/:s",lambda t,s: run_motor(int(t),float(s)))

server.router.post("/api/write_file", lambda data: write_file(data))
server.router.get("/api/read_file", lambda: read_file())
'''
curl -X POST http://192.168.0.192/api/addapi/method/GET/route/_api_greet/handler/greet \
     -d '{"code": "def greet(name): return f\"Hello, {name}!\""}'
curl -X GET http://192.168.0.192/api/greet/John
'''

`];