extends HTTPRequest

func _ready():
	connect("request_completed", Callable(self, "_http_request_completed"))
	
	var url = "http://127.0.0.1:8000/"  # Use 127.0.0.1 instead of 0.0.0.0
	var error = request(url)
	
	if error != OK:
		push_error("An error occurred in the HTTP request.")

func _http_request_completed(result, response_code, headers, body):
	if response_code != 200:
		push_error("HTTP Error: " + str(response_code))
		return
	
	var response = body.get_string_from_utf8()
	print("Server Response:", response)
