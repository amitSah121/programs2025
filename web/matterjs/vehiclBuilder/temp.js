let gameManager;

let squareBlocks = [];
let circleBlocks = [];
let maskingJoints = [];
let nonMaskingJoints = [];
let controllers = [];


function setup() {
    let canvas = createCanvas(800, 600);
    canvas.parent("game-container");

    engine = Matter.Engine.create();
    world = engine.world;

    gameManager = new GameManager();
}

function draw() {
    gameManager.update();
    gameManager.renderer.render();

}


function keyPressed() {
    if (key === 'P') gameManager.setGameMode("play");
    if (key === 'B') gameManager.setGameMode("build");
    if (key === 'D') gameManager.physicsManager.enableDebugMode();

    // Block Controls
    if (key === '1') addBlock(new SquareBlock(random(100, 500), random(100, 500), 50));
    if (key === '2') addBlock(new CircleBlock(random(100, 500), random(100, 500), 50));
    if (key === 'X') removeBlock(squareBlocks.length > 0 ? squareBlocks.pop() : circleBlocks.pop());

    // Joint Controls
    if (key === 'J' && squareBlocks.length >= 2) {
        let blockA = squareBlocks[squareBlocks.length - 2];
        let blockB = squareBlocks[squareBlocks.length - 1];
        let joint = new Joint(blockA, blockB, blockA.attachmentPoints[0], blockB.attachmentPoints[0], true);
        addJoint(joint, true);
    }
    if (key === 'Z' && maskingJoints.length > 0) removeJoint(maskingJoints.pop());

    // Controller Controls
    if (key === 'C' && maskingJoints.length > 0) {
        let controller = new BaseController("rotateCW", maskingJoints[maskingJoints.length - 1]);
        addController(controller);
    }
    if (key === 'V' && controllers.length > 0) removeController(controllers.pop());
}



class AttachmentPoint {
  constructor(x, y, sideNum) {
    this.x = x;
    this.y = y;
    this.sideNum = sideNum; // 0 = Top, 1 = Right, 2 = Bottom, 3 = Left, 4 = Center (Circle Only)
  }
  
  draw() {
    fill(255, 0, 0);
    ellipse(this.x, this.y, 8, 8);
  }
  
  
}


class BaseBlock {
  constructor(typeOfBlock, blockSize) {
    this.typeOfBlock = typeOfBlock; // "rectangle" or "circle"
    this.blockSize = blockSize; // Must be 2,4,8,...2^n
    this.attachmentPoints = this.calculateAttachmentPoints();
  }

  calculateAttachmentPoints() {
    return []; // Placeholder, overridden in subclasses
  }
}


class SquareBlock extends BaseBlock {
  constructor(blockSize) {
    super("rectangle", blockSize);
  }

  calculateAttachmentPoints() {
    let points = [];
    let step = this.blockSize / 2;
    for (let i = -step; i <= step; i += step * 2) {
      points.push(new AttachmentPoint(i, -step, 0)); // Top
      points.push(new AttachmentPoint(i, step, 2)); // Bottom
      points.push(new AttachmentPoint(-step, i, 3)); // Left
      points.push(new AttachmentPoint(step, i, 1)); // Right
    }
    return points;
  }
  
  serialize() {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }
  
  static deserialize(data) {
      return new SquareBlock(data.x, data.y, data.w, data.h);
  }

}

class CircleBlock extends BaseBlock {
  constructor(blockSize) {
    super("circle", blockSize);
  }

  calculateAttachmentPoints() {
    let radius = this.blockSize / 2;
    return [
      new AttachmentPoint(0, -radius, 0), // Top
      new AttachmentPoint(radius, 0, 1), // Right
      new AttachmentPoint(0, radius, 2), // Bottom
      new AttachmentPoint(-radius, 0, 3), // Left
      new AttachmentPoint(0, 0, 4), // Center
    ];
  }
}


class BaseController {
    constructor(type, joint) {
        this.type = type; // Rotation type
        this.joint = joint; // The joint to apply rotation
    }

    call() {
        throw new Error("Method 'call()' must be implemented.");
    }

  
    apply() {
        if (this.type === "rotateCW" && keyIsDown(68)) { // 'D' key
            Matter.Body.rotate(this.joint.blockA.body, 0.05);
        }
        if (this.type === "rotateCCW" && keyIsDown(65)) { // 'A' key
            Matter.Body.rotate(this.joint.blockA.body, -0.05);
        }
    }

}




// KeyDown Rotation Clockwise
class KeyDownControllerRotationClockwise extends BaseController {
    call() {
        document.addEventListener("keydown", (event) => {
            if (event.key === this.type) {
                Matter.Body.applyForce(this.joint.b1, this.joint.b1.position, { x: 0.05, y: 0 });
                Matter.Body.applyForce(this.joint.b2, this.joint.b2.position, { x: -0.05, y: 0 });
            }
        });
    }
}

// KeyDown Rotation AntiClockwise
class KeyDownControllerRotationAntiClockwise extends BaseController {
    call() {
        document.addEventListener("keydown", (event) => {
            if (event.key === this.type) {
                Matter.Body.applyForce(this.joint.b1, this.joint.b1.position, { x: -0.05, y: 0 });
                Matter.Body.applyForce(this.joint.b2, this.joint.b2.position, { x: 0.05, y: 0 });
            }
        });
    }
}

// KeyUp Rotation Clockwise
class KeyUpControllerRotationClockwise extends BaseController {
    call() {
        document.addEventListener("keyup", (event) => {
            if (event.key === this.type) {
                Matter.Body.setAngularVelocity(this.joint.b1, 0);
                Matter.Body.setAngularVelocity(this.joint.b2, 0);
            }
        });
    }
}

// KeyUp Rotation AntiClockwise
class KeyUpControllerRotationAntiClockwise extends BaseController {
    call() {
        document.addEventListener("keyup", (event) => {
            if (event.key === this.type) {
                Matter.Body.setAngularVelocity(this.joint.b1, 0);
                Matter.Body.setAngularVelocity(this.joint.b2, 0);
            }
        });
    }
}

// KeyPressed Rotation Clockwise
class KeyPressedControllerRotationClockwise extends BaseController {
    call() {
        document.addEventListener("keydown", (event) => {
            if (event.key === this.type) {
                Matter.Body.setAngularVelocity(this.joint.b1, 0.1);
                Matter.Body.setAngularVelocity(this.joint.b2, -0.1);
            }
        });

        document.addEventListener("keyup", (event) => {
            if (event.key === this.type) {
                Matter.Body.setAngularVelocity(this.joint.b1, 0);
                Matter.Body.setAngularVelocity(this.joint.b2, 0);
            }
        });
    }
}

// KeyPressed Rotation AntiClockwise
class KeyPressedControllerRotationAntiClockwise extends BaseController {
    call() {
        document.addEventListener("keydown", (event) => {
            if (event.key === this.type) {
                Matter.Body.setAngularVelocity(this.joint.b1, -0.1);
                Matter.Body.setAngularVelocity(this.joint.b2, 0.1);
            }
        });

        document.addEventListener("keyup", (event) => {
            if (event.key === this.type) {
                Matter.Body.setAngularVelocity(this.joint.b1, 0);
                Matter.Body.setAngularVelocity(this.joint.b2, 0);
            }
        });
    }
}



class Joint {    constructor(blockA, blockB, attachmentA, attachmentB, isMasking = false) {
        this.blockA = blockA;
        this.blockB = blockB;
        this.attachmentA = attachmentA;
        this.attachmentB = attachmentB;
        this.isMasking = isMasking;

        this.matterJoint = Matter.Constraint.create({
            bodyA: blockA.body,
            bodyB: blockB.body,
            pointA: { x: attachmentA.x, y: attachmentA.y },
            pointB: { x: attachmentB.x, y: attachmentB.y },
            stiffness: 1,
            damping: 0.1
        });

        Matter.World.add(physicsManager.world, this.matterJoint);

        if (isMasking) {
            Matter.Body.setCollisionFilter(blockA.body, { group: -1 });
            Matter.Body.setCollisionFilter(blockB.body, { group: -1 });
        }
    }
    

    draw() {
        stroke(255);
        line(this.attachmentA.x, this.attachmentA.y, this.attachmentB.x, this.attachmentB.y);
    }
    
    // Add serialization for saving/loading joints (around line 35)
    serialize() {
        return {
            blockA: this.blockA.id,
            blockB: this.blockB.id,
            attachmentA: this.attachmentA,
            attachmentB: this.attachmentB,
            isMasking: this.isMasking
        };
    }
    
    static deserialize(data) {
        let blockA = squareBlocks.find(b => b.id === data.blockA);
        let blockB = squareBlocks.find(b => b.id === data.blockB);
        return new Joint(blockA, blockB, data.attachmentA, data.attachmentB, data.isMasking);
    }


}


class GameManager {
    constructor() {
        this.gameMode = "build";
        this.inputHandler = new InputHandler(32);
        this.uiManager = new UIManager();
        this.physicsManager = new PhysicsManager(engine);
        this.selectedBlock = null;
        this.uiManager = new UIManager(this);
        this.renderer = new Renderer(this);

        this.controllers = [];
    }

    setGameMode(mode) {
        this.gameMode = mode;
        if (mode === "play") {
            this.physicsManager.enablePhysics();
        } else {
            this.physicsManager.disablePhysics();
        }
    }

    update() {
        if (this.gameMode === "build") {
            this.renderBuildMode();
        } else if (this.gameMode === "play") {
            this.renderPlayMode();
            this.physicsManager.update();
        }
    }

    // renderBuildMode() {
    //     background(50);

    //     for (let block of squareBlocks) {
    //         block.draw();
    //     }

    //     for (let joint of maskingJoints) {
    //         joint.draw();
    //     }
        
    //     this.processControllers();

    //     if (this.selectedBlock) {
    //         for (let point of this.selectedBlock.attachmentPoints) {
    //             point.draw();
    //         }
    //     }
    //     this.highlightSelected();

    // }
    
    renderBuildMode() {
        background(50);
        this.renderer.renderBlocks();
    }

    

    renderPlayMode() {  // ✅ Added missing function
        background(30);
        this.renderer.renderBlocks();
        this.renderer.renderJoints();
    }
    
    
    // Press 'D' to enable physics debug
    keyPressed() {
        if (key === 'D') {
            this.physicsManager.enableDebugMode();
        }
    }

    
    highlightSelected() {
        for (let block of squareBlocks) {
            if (block.isSelected) {
                stroke(0, 255, 0);
                strokeWeight(3);
                noFill();
                rect(block.x, block.y, block.w, block.h);
            }
        }
    
        for (let joint of maskingJoints) {
            if (joint.isSelected) {
                stroke(255, 255, 0);
                strokeWeight(3);
                line(joint.attachmentA.x, joint.attachmentA.y,
                     joint.attachmentB.x, joint.attachmentB.y);
            }
        }
    }

    handleMouseClick(x, y) {
        let clickedBlock = this.getBlockAt(x, y);
        if (clickedBlock) {
            if (!this.selectedBlock) {
                this.selectedBlock = clickedBlock;
            } else {
                let pointA = this.selectedBlock.getNearestAttachment(x, y);
                let pointB = clickedBlock.getNearestAttachment(x, y);

                let joint = new Joint(this.selectedBlock, clickedBlock, pointA, pointB);
                maskingJoints.push(joint);
                this.selectedBlock = null;
            }
        }
    }

    getBlockAt(x, y) {
        for (let block of squareBlocks) {
            if (block.contains(x, y)) return block;
        }
        return null;
    }
    
    processControllers() {
        for (let controller of this.controllers) {
            controller.apply();
        }
    }
}


class InputHandler {
    constructor(gridSize) {
        this.gridSize = gridSize;
        this.selectedBlockType = null;
        this.placingBlock = null;

        this.initMouseEvents();
    }

    initMouseEvents() {
        document.addEventListener("mousedown", (event) => this.onMouseDown(event));
        document.addEventListener("mousemove", (event) => this.onMouseMove(event));
    }

    onMouseDown(event) {
        if (this.selectedBlockType) {
            let position = this.getSnappedPosition(event.clientX, event.clientY);
            let newBlock = new SquareBlock(position.x, position.y, this.gridSize);
            squareBlocks.push(newBlock);
            this.placingBlock = null;
        }
    }

    onMouseMove(event) {
        if (this.selectedBlockType) {
            let position = this.getSnappedPosition(event.clientX, event.clientY);
            this.placingBlock = new SquareBlock(position.x, position.y, this.gridSize);
        }
    }

    getSnappedPosition(x, y) {
        return {
            x: Math.round(x / this.gridSize) * this.gridSize,
            y: Math.round(y / this.gridSize) * this.gridSize
        };
    }

  snapToGrid(x, y) {
    return {
        x: Math.round(x / this.gridSize) * this.gridSize,
        y: Math.round(y / this.gridSize) * this.gridSize
    };
  }

    setSelectedBlock(type) {
        this.selectedBlockType = type;
    }
}


class PhysicsManager {
    constructor(engine) {
        this.engine = engine;
        this.world = engine.world;
        this.physicsEnabled = false;
    }

    enablePhysics() {
        this.physicsEnabled = true;
        Matter.Runner.run(Matter.Runner.create(), this.engine);
    }

    disablePhysics() {
        this.physicsEnabled = false;
        Matter.World.clear(this.world, false);
    }
    
    // Add this method (around line 15)
    enableDebugMode() {
        this.debug = true;
    }



    update() {
        if (this.physicsEnabled) {
            Matter.Engine.update(this.engine);
        }
      
        if (this.debug) {
            for (let body of Matter.Composite.allBodies(this.world)) {
                let vertices = body.vertices;
                fill(255, 0, 0, 100);
                beginShape();
                for (let v of vertices) {
                    vertex(v.x, v.y);
                }
                endShape(CLOSE);
            }
        }

    }

    addRigidJoint(blockA, blockB, attachmentA, attachmentB) {
        let joint = Matter.Constraint.create({
            bodyA: blockA.body,
            bodyB: blockB.body,
            pointA: { x: attachmentA.x, y: attachmentA.y },
            pointB: { x: attachmentB.x, y: attachmentB.y },
            stiffness: 1,
            damping: 0.1
        });

        Matter.World.add(this.world, joint);
        return joint;
    }
}


class UIManager {
    constructor() {
        this.controllerMenu = document.createElement("div");
        this.controllerMenu.id = "controller-menu";
        this.controllerMenu.style.display = "none";
        document.body.appendChild(this.controllerMenu);
        this.createUI();
    }

    showControllerMenu(joint) {
        this.controllerMenu.innerHTML = `
            <label>Select Controller Type:</label>
            <select id="controller-type">
                <option value="rotateCW">Rotate Clockwise</option>
                <option value="rotateCCW">Rotate Counterclockwise</option>
            </select>
            <button id="apply-controller">Apply</button>
        `;

        document.getElementById("apply-controller").onclick = () => {
            let type = document.getElementById("controller-type").value;
            let controller = new BaseController(type, joint);
            controllers.push(controller);
            this.hideControllerMenu();
        };

        this.controllerMenu.style.display = "block";
    }

    hideControllerMenu() {
        this.controllerMenu.style.display = "none";
    }

  
    createUI() {
        this.buildButton = createButton('Build Mode');
        this.buildButton.position(10, 10);
        this.buildButton.mousePressed(() => this.gameManager.setGameMode("build"));

        this.playButton = createButton('Play Mode');
        this.playButton.position(100, 10);
        this.playButton.mousePressed(() => this.gameManager.setGameMode("play"));

        this.saveButton = createButton('Save Vehicle');
        this.saveButton.position(200, 10);
        this.saveButton.mousePressed(() => StorageUtils.saveVehicle());

        this.loadButton = createButton('Load Vehicle');
        this.loadButton.position(300, 10);
        this.loadButton.mousePressed(() => StorageUtils.loadVehicle());
    }

}

class Renderer {
    constructor(gameManager) {
        this.gameManager = gameManager;
    }

    render() {
        background(240);

        if (this.gameManager.mode === "build") {
            this.renderBuildMode();
        } else if (this.gameManager.mode === "play") {
            this.renderPlayMode();
        }
    }

    renderBuildMode() {
        this.renderBlocks();
        this.renderJoints();
        this.highlightSelected();
    }

    renderPlayMode() {
        this.renderBlocks();
        this.renderJoints();
    }

    renderBlocks() {
        for (let block of squareBlocks) {
            fill(150);
            stroke(0);
            rect(block.x, block.y, block.w, block.h);
        }

        for (let block of circleBlocks) {
            fill(150);
            stroke(0);
            ellipse(block.x, block.y, block.w);
        }
    }

    renderJoints() {
        strokeWeight(3);
        for (let joint of maskingJoints) {
            stroke(255, 0, 0);
            line(joint.attachmentA.x, joint.attachmentA.y, joint.attachmentB.x, joint.attachmentB.y);
        }

        for (let joint of nonMaskingJoints) {
            stroke(0, 0, 255);
            line(joint.attachmentA.x, joint.attachmentA.y, joint.attachmentB.x, joint.attachmentB.y);
        }
    }

    highlightSelected() {
        for (let block of squareBlocks) {
            if (block.isSelected) {
                stroke(0, 255, 0);
                strokeWeight(3);
                noFill();
                rect(block.x, block.y, block.w, block.h);
            }
        }

        for (let joint of maskingJoints) {
            if (joint.isSelected) {
                stroke(255, 255, 0);
                strokeWeight(3);
                line(joint.attachmentA.x, joint.attachmentA.y, joint.attachmentB.x, joint.attachmentB.y);
            }
        }
    }
}


class StorageUtils {
    static saveVehicle() {
        let data = {
            blocks: squareBlocks.map(block => block.serialize()),
            joints: maskingJoints.map(joint => joint.serialize()),
        };
        localStorage.setItem("vehicleData", JSON.stringify(data));
    }

    static loadVehicle() {
        let data = JSON.parse(localStorage.getItem("vehicleData"));
        if (!data) return;

        squareBlocks = data.blocks.map(blockData => SquareBlock.deserialize(blockData));
        maskingJoints = data.joints.map(jointData => Joint.deserialize(jointData));
    }
}




function addBlock(block) {
  if (block instanceof SquareBlock) {
    squareBlocks.push(block);
  } else if (block instanceof CircleBlock) {
    circleBlocks.push(block);
  }
}

function removeBlock(block) {
  if (block instanceof SquareBlock) {
    squareBlocks.splice(squareBlocks.indexOf(block), 1);
  } else if (block instanceof CircleBlock) {
    circleBlocks.splice(circleBlocks.indexOf(block), 1);
  }
}

function addJoint(joint, masking = false) {
  if (masking) {
    maskingJoints.push(joint);
  } else {
    nonMaskingJoints.push(joint);
  }
}

function removeJoint(joint) {
  let index = maskingJoints.indexOf(joint);
  if (index !== -1) {
    maskingJoints.splice(index, 1);
    return;
  }
  index = nonMaskingJoints.indexOf(joint);
  if (index !== -1) {
    nonMaskingJoints.splice(index, 1);
  }
}

function addController(controller) {
  controllers.push(controller);
}

function removeController(controller) {
  const index = controllers.indexOf(controller);
  if (index !== -1) {
    controllers.splice(index, 1);
  }
}


/*


body {
    margin: 0;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #222;
}

#game-container {
    position: relative;
    width: 800px;
    height: 600px;
    background-color: #444;
}

canvas {
    display: block;
    border: 2px solid white;
}

#ui-container {
    position: absolute;
    top: 10px;
    left: 10px;
}

button {
    padding: 10px;
    margin: 5px;
    background-color: #fff;
    border: none;
    cursor: pointer;
}


<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vehicle Builder Game</title>
    
    <!-- Matter.js and P5.js libraries -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.20.0/matter.min.js" integrity="sha512-6+7rTBmR6pRFe9fa0vCFjFaHZj/XYa7774bEBzRtxgdpIJOS++R3cKd6Prg/eJmxtsJotd8KAg4g57uuVQsZKA==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.11.2/p5.min.js" integrity="sha512-1YMgn4j8cIL91s14ByDGmHtBU6+F8bWOMcF47S0cRO3QNm8SKPNexy4s3OCim9fABUtO++nJMtcpWbINWjMSzQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>

    <!-- Styles -->
    <link rel="stylesheet" href="styles/style.css">
</head>
<body>
    
      <div id="game-container">
        <canvas id="gameCanvas"></canvas>
        <div id="ui-container">
            <button id="play-mode">Play Mode</button>
            <button id="build-mode">Build Mode</button>
        </div>
      </div>

    <!-- Core Game Files -->
    <!--<script src="src/core/BaseBlock.js"></script>-->
    <!--<script src="src/core/SquareBlock.js"></script>-->
    <!--<script src="src/core/CircleBlock.js"></script>-->
    <!--<script src="src/core/AttachmentPoint.js"></script>-->
    <!--<script src="src/core/Joint.js"></script>-->
    <!--<script src="src/core/BaseController.js"></script>-->
    <!--<script src="src/core/Controllers.js"></script>-->

    <!-- Game Management -->
    <!--<script src="src/game/UIManager.js"></script>-->
    <!--<script src="src/game/States.js"></script> -->
    <!--<script src="src/game/GameManager.js"></script>-->
    <!--<script src="src/game/PhysicsManager.js"></script>-->
    <!--<script src="src/game/InputHandler.js"></script>-->

    <!-- Utilities -->
    <!--<script src="src/utils/MathUtils.js"></script>-->
    <!--<script src="src/utils/StorageUtils.js"></script>-->

    <!-- Rendering -->
    <!--<script src="src/render/Renderer.js"></script>-->

    <!-- Entry Point -->
    <!--<script src="src/main.js"></script>-->
    
    
    <script src="index.js"></script>

</body>
</html>


*/