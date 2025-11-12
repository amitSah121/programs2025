let key_;

// testing normal class
function setup() {
  createCanvas(400, 400);

  key_ = new KeyController();
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
