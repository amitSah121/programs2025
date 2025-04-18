extends CharacterBody2D


const SPEED = 300.0


func _physics_process(delta):
	# Add the gravity.
	#if velocity.d > 0:
		#velocity -= velocity * SPEED * delta

	# Handle jump.
	if Input.is_action_just_pressed("ui_accept") and is_on_floor():
		velocity.y += 1

	# Get the input direction and handle the movement/deceleration.
	# As good practice, you should replace UI actions with custom gameplay actions.
	var direction_x = Input.get_axis("ui_left", "ui_right")
	var direction_y = Input.get_axis("ui_up", "ui_down") 
	if direction_y:
		velocity.y = direction_y * SPEED
	if direction_x:
		velocity.x = direction_x * SPEED

	move_and_slide()
