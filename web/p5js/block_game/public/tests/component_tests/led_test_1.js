let led1;

function setup() {
  createCanvas(400, 400);

  led1 = new Led();
  console.log("value before: ", led1.state);
  led1.set_input("inp1", 300);
  led1.call_event("update", {});
  console.log("value after: ", led1.state);
  led1.set_input("inp1", -300);
  led1.call_event("update", {});
  console.log("value after -300: ", led1.state);
}

function draw() {
  background(220);
  push();
  fill(colors.red[100]);
  pop();
}
