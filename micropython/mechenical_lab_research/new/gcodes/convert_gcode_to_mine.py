import re
import csv

def interpolate_steps(distance, max_step=4.0):
    steps = int(abs(distance) // max_step)
    remainder = abs(distance) % max_step
    step_values = [max_step] * steps + ([remainder] if remainder > 0 else [])
    if distance < 0:
        step_values = [-val for val in step_values]
    return step_values

def parse_gcode(file_path):
    gcode_data = []
    api_calls = []
    
    lines = '''
; --- START G-CODE ---
M104 S200     ; Set hotend temperature to 200°C
M140 S60      ; Set bed temperature to 60°C
M190 S60      ; Wait for bed to reach 60°C
M109 S200     ; Wait for hotend to reach 200°C
G28           ; Home all axes
G92 X0 Y0 Z0 E0  ; Set current position to zero

; --- PRINT MOVEMENTS ---
G1 Z0.2 F1000  ; Move nozzle to 0.2mm above bed
G1 X10 Y10 E5 F1500  ; Move to (10,10) and extrude 5mm of filament
G1 X50 Y50 E10  ; Move to (50,50) and extrude 10mm
G1 X100 Y100 E15  ; Move to (100,100) and extrude 15mm

; --- END G-CODE ---
G1 Z10 F1000   ; Raise nozzle after print
M104 S0        ; Turn off hotend
M140 S0        ; Turn off bed
M107           ; Turn off fan
M84            ; Disable motors
    '''.split("\n")
    
    for line in lines:
        line = line.split(';')[0].strip()  # Remove comments
        if not line:  # Ignore empty lines
            continue
        
        if line.startswith('M'):
            api_calls.append(f"/api/{line.replace(' ', '/')}" )
        
        elif line.startswith('G'):
            params = {'X': 0, 'Y': 0, 'Z': 0, 'E': 0, 'F': 1000}
            
            matches = re.findall(r'([XYZEF])([-+]?[0-9]*\.?[0-9]+)', line)
            for key, value in matches:
                params[key] = float(value)
            
            # Interpolation if distance exceeds max step
            interpolated_steps = {
                key: interpolate_steps(params[key]) if key in params else [0]
                for key in 'XYZE'
            }
            
            max_interpolations = max(len(v) for v in interpolated_steps.values())
            
            for i in range(max_interpolations):
                step_values = {
                    key: interpolated_steps[key][i] if i < len(interpolated_steps[key]) else 0
                    for key in 'XYZE'
                }
                
                motor = [1 if step_values[key] != 0 else 0 for key in 'XYZE'] + [0]
                distance = [abs(step_values[key]) for key in 'XYZE'] + [0]
                run = [1 if step_values[key] >= 0 else 0 for key in 'XYZE'] + [0]
                
                gcode_data.append(motor + distance + run)
    
    # Convert G-code data to CSV string
    csv_output = "motorx,motory,motorz,motors1,motors2,distancex,distancey,distancez,distances1,distances2,runx,runy,runz,runs1,runs2\n"
    csv_output += "\n".join(",".join(map(str, row)) for row in gcode_data)
    
    # Join API calls into a single string
    api_output = "\n".join(api_calls)
    
    return csv_output, api_output

# Example usage:
file_path = "gcode_input.txt"  # Replace with actual G-code file path
csv_result, api_result = parse_gcode(file_path)

# Print results
print(csv_result)
print(api_result)
