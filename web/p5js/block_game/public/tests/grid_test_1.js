let ginf, gfin;
let zoom = 1;

function setup() {
  createCanvas(400, 600);

  ginf = new Grid(10, 10, true);
  gfin = new Grid(10, 10, false, 100, 100, 100, 100);
}

function draw() {
  background(colors.red[100]);
  //   test_infinite();
  //   test_finite();
  //   test_finite_dim_change();
  //   test_finite_pos_change();
  //   test_finite_pos_change_mouse();
  //   test_finite_pos_pan();
  //   test_pseudo_infinite_pan();

  // Test if scaling the whole world works as a layer zoomin or zoomout
  push();
  scale(zoom);
  test_pseudo_infinite_pan();
  pop();
}

/*
This test checks if an infinite grid is formed, note: it doesnot have pan movement
*/
const test_infinite = () => {
  ginf.draw(colors.red[200]);
};

/*
This test checks if an finite grid is formed with color red
*/
const test_finite = () => {
  gfin.draw(colors.red[200]);
};

/*
This test checks if an finite grid is formed with color red, and custom dimension
*/
const test_finite_dim_change = () => {
  gfin.dim(50, 200);
  gfin.draw(colors.red[200]);
};

/*
This test checks if an finite grid is formed with color red, changing position
*/
const test_finite_pos_change = () => {
  gfin.pos(50, 50);
  gfin.draw(colors.red[200]);
};

/*
This test checks if an finite grid is formed with color red, changing mouse position
*/
const test_finite_pos_change_mouse = () => {
  gfin.pos(mouseX, mouseY);
  gfin.draw(colors.red[200]);
};

/*
This test checks if an finite grid is formed with color red, pan movement
*/
const test_finite_pos_pan = () => {
  if (mouseIsPressed) {
    gfin.delpos(mouseX - pmouseX, mouseY - pmouseY);
  }
  gfin.draw(colors.red[200]);
};

/*
This test checks if pseudo infinite can be formed with finite grid with color red, pan
*/
const test_pseudo_infinite_pan = () => {
  gfin.dim(1000, 1000);
  if (mouseIsPressed) {
    gfin.delpos(mouseX - pmouseX, mouseY - pmouseY);
  }
  gfin.draw(colors.red[200]);
};

function keyReleased() {
  if (key == "c") {
    zoom -= 0.1;
  } else if (key == "v") {
    zoom += 0.1;
  }
}
