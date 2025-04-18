import machine
import utime

# Define the ADC pin for temperature sensor (e.g., LM35 or NTC thermistor)
adc = machine.ADC(28)

# Define the relay control pin (e.g., GP15)
relay = machine.Pin(15, machine.Pin.OUT)

# LM35: 10mV per degree Celsius (Modify for other sensors if needed)
def read_temperature():
    voltage = adc.read_u16() * (3.3 / 65535)  # Convert raw ADC value to voltage
    temperature = voltage * 100  # Convert voltage to temperature (LM35)
    return temperature



relay.value(0)
print("Relay ON")

while True:
    temp = read_temperature()
    print(f"Temperature: {temp:.2f}°C")
#     
#     # Relay control logic (Modify threshold as needed)
#     if temp > 30:  # Turn relay ON if temp > 30°C
#         relay.value(1)
#         print("Relay ON")
#     else:  # Turn relay OFF otherwise
#         relay.value(0)
#         print("Relay OFF")
#     
    utime.sleep(2)  # Wait 2 seconds before next reading

