function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  push();
  fill(colors.red[100]);
  pop();
}

/*
PLAN
=======

The game ui will overate over the world meaning it won't get affected by the translation and scaling of the original world.
World and Ui will communicate with each other using convert_world_coord_to_ui and convert_ui_coord_to_world functions. 
*/
