let led1, key1, key2, wire1;

function setup() {
  createCanvas(400, 400);

  led1 = new Led();
  key1 = new KeyController();
  key2 = new KeyController();
  key2.call_event("change", { inp1: "b", inp2: "released", inp3: -300 });
  wire1 = new Wire(key1, led1);
  wire2 = new Wire(key2, led1);
}

function draw() {
  background(220);
  push();
  if (led1.state) fill(colors.red[500]);
  else fill(colors.blue[500]);
  rect(100, 100, 100, 100);

  pop();
}
