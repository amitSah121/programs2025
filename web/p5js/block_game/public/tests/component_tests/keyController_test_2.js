let key_;

// testing change call event
function setup() {
  createCanvas(400, 400);

  key_ = new KeyController();
  key_.call_event("change", { inp1: "b", inp2: "released", inp3: "Hello" });
  key_.set_event("wire", (e) => {
    console.log("wired: ", e);
  });
}

function draw() {
  background(220);
  push();
  fill(colors.red[100]);
  pop();
}
