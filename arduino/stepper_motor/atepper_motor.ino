#include <Stepper.h>

const int stepsPerRevolution = 200;  // Change according to your stepper motor

// Initialize the stepper library on pins 8 through 11:
Stepper myStepper(stepsPerRevolution, 8, 9, 10, 11);

void setup() {
  // Set the speed at 60 RPM:
  myStepper.setSpeed(600);
}

void loop() {
  // Step one revolution in one direction:
  myStepper.step(stepsPerRevolution);
  delay(10);

  // Step one revolution in the other direction:
  // myStepper.step(-stepsPerRevolution);
  // delay(1000);
}
