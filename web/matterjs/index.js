// Matter.js and p5.js setup
// Matter.js modules
let Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Constraint = Matter.Constraint,
    Mouse = Matter.Mouse,
    MouseConstraint = Matter.MouseConstraint;

let engine, world;
let player, ground;
let elements = [];
let constraints = [];
let attaching = false;
let selectedElement = null;
let buildMode = true;

let boxButton, circleButton, attachButton;

function setup() {
  createCanvas(800, 600);
  engine = Engine.create();
  world = engine.world;

  // Create the player
  player = Bodies.rectangle(200, 300, 50, 50, { friction: 0.1 });
  World.add(world, player);

  // Create the ground
  ground = Bodies.rectangle(400, height - 20, width, 40, { isStatic: true });
  World.add(world, ground);

  // Create UI buttons
  boxButton = createButton('Create Box');
  boxButton.position(20, height - 60);
  boxButton.mousePressed(() => createElement('box'));

  circleButton = createButton('Create Circle');
  circleButton.position(120, height - 60);
  circleButton.mousePressed(() => createElement('circle'));

  attachButton = createButton('Start Attachment');
  attachButton.position(220, height - 60);
  attachButton.mousePressed(() => attaching = true);
}

function createElement(type) {
  if (!buildMode) return; // Only allow creating in build mode

  let x = player.position.x + random(-50, 50);
  let y = player.position.y - 50;

  let el;
  if (type === "box") {
    el = { body: Bodies.rectangle(x, y, 40, 40), w: 40, h: 40, shape: "box" };
  } else if (type === "circle") {
    el = { body: Bodies.circle(x, y, 20), r: 20, shape: "circle" };
  }

  World.add(world, el.body);
  elements.push(el);
}

function draw() {
  background(135, 206, 235);
  Engine.update(engine);

  // Camera follows the player
  let camX = width / 2 - player.position.x;
  let camY = height / 2 - player.position.y;
  translate(camX, camY);

  // Draw ground
  fill(100, 50, 20);
  rectMode(CENTER);
  rect(ground.position.x, ground.position.y, width, 40);

  // Draw player
  fill(255, 0, 0);
  push();
  translate(player.position.x, player.position.y);
  rotate(player.angle);
  rect(0, 0, 50, 50);
  pop();

  // Draw elements
  for (let el of elements) {
    fill(0, 255, 0);
    push();
    translate(el.body.position.x, el.body.position.y);
    rotate(el.body.angle);
    if (el.shape === "box") {
      rect(0, 0, el.w, el.h);
    } else if (el.shape === "circle") {
      ellipse(0, 0, el.r * 2);
    }
    pop();
  }

  // Draw constraints
  stroke(255);
  for (let con of constraints) {
    line(con.bodyA.position.x, con.bodyA.position.y, con.bodyB.position.x, con.bodyB.position.y);
  }

  // Show mode status
  resetMatrix(); // Reset translation for UI elements
  fill(255);
  textSize(16);
  if (attaching) {
    text("Attachment Mode: Select two elements", 10, 40);
  } else {
    text(buildMode ? "Build Mode (Press Ctrl+R to Play)" : "Play Mode (Press Esc to Build)", 10, 20);
  }
}

function keyPressed() {
  let force = 0.02;

  if (!buildMode) {
    if (keyCode === 65) { // 'A' key (Left)
      Body.applyForce(player, player.position, { x: -force, y: 0 });
    } else if (keyCode === 68) { // 'D' key (Right)
      Body.applyForce(player, player.position, { x: force, y: 0 });
    } else if (keyCode === 87) { // 'W' key (Jump)
      if (isOnGround(player)) { // Ensure player is on ground before jumping
        Body.applyForce(player, player.position, { x: 0, y: -force * 3 });
      }
    }
  }
  
 if (keyCode === LEFT_ARROW) {
    for (let el of elements) {
      if (el.shape === "box") {
        Body.setAngularVelocity(el.body, -0.1);
      }
    }
  } else if (keyCode === RIGHT_ARROW) {
    for (let el of elements) {
      if (el.shape === "box") {
        Body.setAngularVelocity(el.body, 0.1);
      }
    }
  }
  
  if (keyCode === 17 && keyIsDown(82)) { // Ctrl+R to play mode
    buildMode = false;
  } else if (keyCode === 27) { // Esc to build mode
    buildMode = true;
  } else if (keyCode === 65) { // 'A' to start attachment mode
    attaching = true;
    selectedElement = null;
  }

  // Keep player upright (prevent unwanted rotation)
  Body.setAngle(player, 0);
  Body.setAngularVelocity(player, 0);
}

// Function to check if player is on the ground
function isOnGround(body) {
  let buffer = 5; // Small buffer to detect ground contact
  for (let el of elements) {
    if (el.shape === "box" || el.shape === "circle") {
      let d = dist(body.position.x, body.position.y + body.bounds.max.y - buffer, el.body.position.x, el.body.position.y);
      if (d < 30) {
        return true;
      }
    }
  }
  return body.position.y >= ground.position.y - 40; // Check if touching the ground
}

function mousePressed() {
  if (attaching) {
    let clickedElement = null;
    
  let camX = width / 2 - player.position.x;
  let camY = height / 2 - player.position.y;

    // Find nearest element
    for (let el of elements) {
      let d = dist(mouseX - camX, mouseY - camY, el.body.position.x, el.body.position.y);
      if (d < 30) {
        clickedElement = el;
        break;
      }
    }

    if (clickedElement) {
      if (!selectedElement) {
        selectedElement = clickedElement;
      } else {
        // Create a weld-like constraint with near-zero length
        let con = Constraint.create({
          bodyA: selectedElement.body,
          bodyB: clickedElement.body,
          pointA: { x: selectedElement.body.position.x - (mouseX - camX), y: selectedElement.body.position.y - (mouseY - camY) },
          pointB: { x: 0, y: 0 },
          stiffness: 1, // Stiffness to simulate welding
          damping: 0.1,
          // length: 0.01 // Near zero to make elements visually snap together
        });

        World.add(world, con);
        constraints.push(con);

        // Disable collisions between attached bodies
        selectedElement.body.collisionFilter.group = -1;
        clickedElement.body.collisionFilter.group = -1;

        attaching = false;
      }
    }
  }
}

function keyTyped() {
  
  let camX = width / 2 - player.position.x;
  let camY = height / 2 - player.position.y;
  if (buildMode) {
    if (key === 'r') { // Create box
      let box = Bodies.rectangle(mouseX-camX, mouseY-camY, 50, 50);
      World.add(world, box);
      elements.push({ body: box, shape: "box", w: 50, h: 50 });
    } else if (key === 'c') { // Create circle
      let circle = Bodies.circle(mouseX-camX, mouseY-camY, 25);
      World.add(world, circle);
      elements.push({ body: circle, shape: "circle", r: 25 });
    }
  }
}
