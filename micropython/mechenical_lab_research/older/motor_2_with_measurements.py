from machine import Pin
from time import sleep, sleep_us, ticks_ms

# Motor and distance parameters
steps_per_revolution = 200         # Number of steps per motor revolution
pitch_mm_per_rev = 2.0             # Linear distance per revolution (in mm)
distance_per_step = pitch_mm_per_rev / steps_per_revolution

# Define pins
direction_pin = Pin(20, Pin.OUT)
pulse_pin = Pin(21, Pin.OUT)

# Define directions
cw_direction = 0
ccw_direction = 1

# Set initial direction
direction_pin.value(cw_direction)

# Distance counter
linear_distance = 0.0

# Start time
start_time = ticks_ms()

# Run for 5 seconds
while ticks_ms() - start_time < 5000:  # 5 seconds
    print('Direction CW')
    sleep(0.5)
    direction_pin.value(cw_direction)
    
    for _ in range(steps_per_revolution):  # Full rotation
        pulse_pin.value(1)
        sleep_us(1000)  # 1 ms pulse
        pulse_pin.value(0)
        sleep_us(500)   # 0.5 ms delay
        linear_distance += distance_per_step  # Increment distance

    print(f"Linear Distance CW: {linear_distance:.2f} mm")

    print('Direction CCW')
    sleep(0.5)
    direction_pin.value(ccw_direction)
    
    for _ in range(steps_per_revolution):
        pulse_pin.value(1)
        sleep_us(1000)
        pulse_pin.value(0)
        sleep_us(500)
        linear_distance += distance_per_step  # Increment distance

    print(f"Linear Distance CCW: {linear_distance:.2f} mm")

print("5 seconds elapsed. Stopping motor...")
print(f"Total Linear Distance Covered: {linear_distance:.2f} mm")

# Clean up
pulse_pin.value(0)
direction_pin.value(0)

