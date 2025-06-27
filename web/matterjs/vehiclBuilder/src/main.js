let gameManager;

function setup() {
    let canvas = createCanvas(800, 600);
    canvas.parent("game-container");

    engine = Matter.Engine.create();
    world = engine.world;

    gameManager = new GameManager();
}

function draw() {
    gameManager.update();
}

// Add a key listener for switching modes (around line 20)
function keyPressed() {
    if (key === 'P') gameManager.setGameMode("play");
    if (key === 'B') gameManager.setGameMode("build");
    if (key === 'D') gameManager.physicsManager.enableDebugMode();
}
