extends Control
class_name NakamaMultiplayer

var session : NakamaSession
var client : NakamaClient
var socket : NakamaSocket

# Called when the node enters the scene tree for the first time.
func _ready():
	client = Nakama.create_client("defaultkey", "127.0.0.1", 7350, "http")
	var device_id = OS.get_unique_id()
	var vars = {
		"device_os" : OS.get_name,
		"model" : OS.get_model_name()
	}
	session = await client.authenticate_device_async(device_id, null, true, vars)
	if session.is_exception():
		print("An error occurred: %s" % session)
		return
	print("Successfully authenticated: %s" % session)
	socket = Nakama.create_socket_from(client)
	
	socket.connected.connect(onSocketConnect)
	socket.closed.connect(onSocketClosed)
	socket.received_error.connect(onSocketReceivedError)
	
	socket.received_match_presence.connect(onSocketReceivedMatchPresence)
	socket.received_match_state.connect(onSocketReceivedMatcheState)
	
	update_account("client01")

func update_account(name):
	client.update_account_async(session, name,)

func onSocketConnect():
	print("Connected: "+OS.get_unique_id())

func onSocketClosed():
	print("Closed")
	
func onSocketReceivedError(err):
	print("Error: "+str(err))

func onSocketReceivedMatchPresence(presence: NakamaRTAPI.MatchPresenceEvent):
	pass
	
func onSocketReceivedMatcheState(state: NakamaRTAPI.MatchData):
	pass


func _on_getdata_pressed():
	var savegame = {"hello":[1,2,3]}
	
	var res = await client.write_storage_objects_async(session,[
	NakamaWriteStorageObject.new("saves","savegame",1,1, JSON.stringify(savegame),"")
	])
	if res.is_exception():
		print("data not saved")


func _on_storedata_pressed():
	var res = await client.read_storage_objects_async(session, [
		NakamaStorageObjectId.new("saves","savegame", session.user_id)
	])
	
	if res.is_exception():
		print("data not saved")

	print(res.objects)
