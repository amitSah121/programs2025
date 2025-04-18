from machine import Pin
from time import sleep, sleep_us, ticks_ms

# Define pins
direction_pin = Pin(20, Pin.OUT)
pulse_pin = Pin(21, Pin.OUT)

# Define directions
cw_direction = 0
ccw_direction = 1

# Set initial direction
direction_pin.value(cw_direction)

# Start time
start_time = ticks_ms()

s1 = 1 ## how many seconds it rotates, given on steps provided in steps var
s2 = 5 ## how much it stops in steps var
steps = 600
total_time = 5000 ## 5sec
sleep_time = 1 ## 1 s
num_steps = total_time/sleep_time ## 5000/1000 = 5


# Run for 5 seconds
while ticks_ms() - start_time < 5000:  # 5000 ms = 5 seconds
    print('Direction CW')
    sleep(1) ## in ms
    direction_pin.value(cw_direction)
    for _ in range(steps):
        pulse_pin.value(1)
        sleep_us(s1)  # 1 ms pulse
        pulse_pin.value(0)
        sleep_us(s2)   # 0.5 ms delay

    print('Direction CCW')
    sleep(1) ## in ms
    direction_pin.value(ccw_direction)
    for _ in range(steps):
        pulse_pin.value(1)
        sleep_us(s1)
        pulse_pin.value(0)
        sleep_us(s2)

print("5 seconds elapsed. Stopping motor...")
# Clean up
pulse_pin.value(0)
direction_pin.value(0)

