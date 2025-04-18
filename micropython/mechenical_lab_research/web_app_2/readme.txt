# navigation
  - home/3d-printing module
    - upload gcode file
    - convert gcode to custom_control_file
    - publish the custom_control_file
    - run the file
  - documentation
    - from client side
      - how to fetch 
        - post
        - get
      - how to create an api
        - get
        - post
      - how to delete an api
        - get
        - post
    - on server side directly
      - how to create an api
        - get
        - post
    - faqs
  - apis
    - select option
      - create get api
      - create post api

# required

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
