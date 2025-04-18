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


def forward():
    direction_pin.value(cw_direction)
    
    for _ in range(steps_per_revolution):  # Full rotation
        pulse_pin.value(1)
        sleep_us(1000)  # 1 ms pulse
        pulse_pin.value(0)
        sleep_us(500)   # 0.5 ms delay
#         linear_distance += distance_per_step  # Increment distance

def backward():
    direction_pin.value(ccw_direction)
    
    for _ in range(steps_per_revolution):
        pulse_pin.value(1)
        sleep_us(1000)
        pulse_pin.value(0)
        sleep_us(500)
#         linear_distance += distance_per_step  # Increment distance

## total = 161 mm given 1mm travel distance in width
## total = 235 mm given 1mm travel distance in length
## total = 110 mm given travel distance in z-axis

total_times = 110
sleep_time = 0.2

# Run for 5 seconds
for i in range(total_times):
    print('Direction CW')
    sleep(sleep_time)

    forward()

#     print('Direction CCW')
#     sleep(sleep_time)
#
#     backward()

# print("5 seconds elapsed. Stopping motor...")
# print(f"Total Linear Distance Covered: {linear_distance:.2f} mm")

# Clean up
pulse_pin.value(0)
direction_pin.value(0)


