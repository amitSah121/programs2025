from machine import Pin
from time import sleep_us, sleep

# Define pins
direction_pin = Pin(20, Pin.OUT)  # Direction control pin
pulse_pin = Pin(21, Pin.OUT)      # Step pulse control pin

# Define directions
cw_direction = 0                  # Clockwise direction
ccw_direction = 1                 # Counterclockwise direction

# Function to move the motor forward (Clockwise)
def forward(number_of_steps, distance_each_step):
    """
    Moves the motor forward (Clockwise) for a specified number of steps.
    
    Args:
        number_of_steps (int): The number of steps to move.
        distance_each_step (float): Distance moved in each step (mm).
    """
    direction_pin.value(cw_direction)  # Set direction to Clockwise
    print(f"Moving Forward: {number_of_steps} steps, {distance_each_step:.2f} mm per step")
    
    total_distance = 0.0  # Track total distance moved

    for step in range(number_of_steps):
        # Generate a step pulse
        pulse_pin.value(1)  # Set pulse high
        sleep_us(1000)      # 1 ms pulse duration
        pulse_pin.value(0)  # Set pulse low
        sleep_us(500)       # 0.5 ms delay between pulses
        
        # Update the total distance moved
        total_distance += distance_each_step
        
        # Optional: Print progress
        print(f"Step {step + 1}/{number_of_steps}, Distance: {total_distance:.2f} mm")
        sleep(0.1)
    
    print(f"Forward movement complete. Total distance: {total_distance:.2f} mm\n")


# Function to move the motor backward (Counterclockwise)
def backward(number_of_steps, distance_each_step):
    """
    Moves the motor backward (Counterclockwise) for a specified number of steps.
    
    Args:
        number_of_steps (int): The number of steps to move.
        distance_each_step (float): Distance moved in each step (mm).
    """
    direction_pin.value(ccw_direction)  # Set direction to Counterclockwise
    print(f"Moving Backward: {number_of_steps} steps, {distance_each_step:.2f} mm per step")
    
    total_distance = 0.0  # Track total distance moved

    for step in range(number_of_steps):
        # Generate a step pulse
        pulse_pin.value(1)  # Set pulse high
        sleep_us(1000)      # 1 ms pulse duration
        pulse_pin.value(0)  # Set pulse low
        sleep_us(500)       # 0.5 ms delay between pulses
        
        # Update the total distance moved
        total_distance += distance_each_step
        
        sleep(0.1)
        
        # Optional: Print progress
        print(f"Step {step + 1}/{number_of_steps}, Distance: {total_distance:.2f} mm")
    
    print(f"Backward movement complete. Total distance: {total_distance:.2f} mm\n")


# Example Usage
# Specify the number of steps and distance per step (in mm)
forward_steps = 5
backward_steps = 5
distance_per_step = 0.01  # Example: 0.01 mm per step

# Move the motor forward
# forward(forward_steps, distance_per_step)

# Move the motor backward
backward(backward_steps, distance_per_step)

# Clean up
pulse_pin.value(0)
direction_pin.value(0)
print("Motor stopped and pins reset.")

