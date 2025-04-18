extends Node2D

var multiplayer_peer = ENetMultiplayerPeer.new()

const PORT = 3000
const ADDRESS = "127.0.0.1"

const player = "res://scripts/player.tscn"

var connections = []

func _on_host_pressed():
	$name.text = "Server"
	multiplayer_peer.create_server(PORT)
	multiplayer.multiplayer_peer = multiplayer_peer
	$id.text = str(multiplayer_peer.get_unique_id())
	connections.append($id.text)
	add_player($id.text)
	#print("hello")
	
	multiplayer_peer.peer_connected.connect(
		func(new_peer_id):
			#print(new_peer_id)
			#await get_tree().create_timer(1).timeout
			rpc("add_player_character",new_peer_id)
			connections.append(str(new_peer_id))
			rpc_id(new_peer_id,"add_prev_player_character",connections)
			#add_player.rpc(new_peer_id)
	)



func _on_join_pressed():
	$name.text = "Client"
	multiplayer_peer.create_client(ADDRESS,PORT)
	multiplayer.multiplayer_peer = multiplayer_peer
	$id.text = str(multiplayer_peer.get_unique_id())
	#connections.append($id.text)
	add_player($id.text)
	

@rpc("call_local")
func add_player_character(id):
	add_player(str(id))
	
@rpc
func add_prev_player_character(prev_conns):
	#print(prev_conns)
	for i in prev_conns:
		add_player(i)

func add_player(id):
	var p = preload(player).instantiate()
	p.set_multiplayer_authority(int(id))
	add_child(p)
	p.get_node("message").text = id
