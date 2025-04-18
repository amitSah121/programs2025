extends HTTPRequest


# Called when the node enters the scene tree for the first time.
func _ready():
	$".".request_completed.connect(self._http_request_completed)
	var error = $".".request("https://www.google.com")
	if error != OK:
		push_error("An error occurred in the HTTP request.")



# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	pass


func _http_request_completed(result, response_code, headers, body):
	var response = body.get_string_from_utf8()
	print(response)
