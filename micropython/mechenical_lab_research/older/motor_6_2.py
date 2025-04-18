from machine import Pin
from time import sleep, sleep_us

# Motor and distance parameters
steps_per_revolution = 200  # Steps per full motor revolution
pitch_mm_per_rev = 2.0  # Distance per revolution (mm)
distance_per_step = pitch_mm_per_rev / steps_per_revolution

# Define motor pins
motor_pins = [
    {"dir": Pin(20, Pin.OUT), "pulse": Pin(21, Pin.OUT)},  # Motor 0
    {"dir": Pin(18, Pin.OUT), "pulse": Pin(19, Pin.OUT)},  # Motor 1
    {"dir": Pin(16, Pin.OUT), "pulse": Pin(17, Pin.OUT)},  # Motor 2
    {"dir": Pin(14, Pin.OUT), "pulse": Pin(15, Pin.OUT)},  # Motor 3
    {"dir": Pin(12, Pin.OUT), "pulse": Pin(13, Pin.OUT)},  # Motor 4
]

# Speed control
speed = 1000.0
factor = 1 / 1000

def step_motor(motor_instruct, direction, distance_mm):
    """
    Move motors based on instructions.

    :param motor_instruct: List of lists, where 1 indicates which motors to move.
    :param direction: List of lists indicating direction (0 = CW, 1 = CCW).
    :param distance_mm: List of lists indicating movement distance in mm.
    """
    for step_idx in range(len(motor_instruct)):  # Loop over each instruction step
        active_motors = [
            i for i, move in enumerate(motor_instruct[step_idx]) if move == 1
        ]

        if not active_motors:
            continue  # Skip if no motors are active in this step

        # Set directions
        for motor in active_motors:
            motor_pins[motor]["dir"].value(direction[step_idx][motor])

        # Find max steps required
        max_steps = max(
            [int(distance_mm[step_idx][motor] / distance_per_step) for motor in active_motors]
        )

        # Move all active motors in sync
        for _ in range(max_steps):
            for motor in active_motors:
                steps_to_move = int(distance_mm[step_idx][motor] / distance_per_step)
                if steps_to_move > 0:
                    motor_pins[motor]["pulse"].value(1)

            sleep_us(int(1000.0 * factor * speed))  # 1 ms pulse

            for motor in active_motors:
                steps_to_move = int(distance_mm[step_idx][motor] / distance_per_step)
                if steps_to_move > 0:
                    motor_pins[motor]["pulse"].value(0)

            sleep_us(int(500.0 * factor * speed))  # 0.5 ms delay

        sleep(0.5)  # Pause between steps

# Example input
motor_instruct = [
    [0, 0, 1, 0, 0],  # Only motor 2 moves
    [0, 1, 1, 0, 0],  # Motor 1 and 2 move
    [1, 0, 1, 0, 1],  # Motor 0, 2, and 4 move
]

direction = [
    [0, 0, 1, 0, 0],  # Only motor 2 moves CW, others CCW
    [0, 1, 1, 0, 0],  # Motor 1 and 2 move CW, others CCW
    [1, 0, 1, 0, 1],  # Motors 0, 2, and 4 move CW, others CCW
]

# goes half the distnce
distance_mm = [
    [0, 0, 2, 0, 0],  # Only motor 2 moves 2 mm
    [0, 1, 2, 0, 0],  # Motor 1 moves 1 mm, motor 2 moves 2 mm
    [1, 0, 1, 0, 1],  # Motors 0, 2, and 4 move 1 mm each
]

# Run the motor sequence
step_motor(motor_instruct, direction, distance_mm)

# Stop all motor signals
for motor in motor_pins:
    motor["pulse"].value(0)
