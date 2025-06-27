// Constants
const GRID_SIZE = 32;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

// Global Variables
let engine;
let world;
let gameManager;
let squareBlocks = [];
let circleBlocks = [];
let maskingJoints = [];
let nonMaskingJoints = [];
let controllers = [];
let platform;



function setup() {
  
    let canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    canvas.parent("game-container");

    engine = Matter.Engine.create();
    world = engine.world;
    
    // Disable gravity initially
    world.gravity.y = 0;

    gameManager = new GameManager();
    
    // Create UI elements
    createUI();
}

function createUI() {
    const uiContainer = createElement('div');
    uiContainer.id('ui-container');
    uiContainer.style('position', 'absolute');
    uiContainer.style('top', '10px');
    uiContainer.style('left', '10px');
    uiContainer.style('display', 'flex');
    uiContainer.style('gap', '10px');
    
    // Mode buttons
    createModeButton('Build Mode (B)', 'build', 'B');
    createModeButton('Play Mode (P)', 'play', 'P');
    
    // Block buttons
    createBlockButton('Add Square (1)', '1');
    createBlockButton('Add Circle (2)', '2');
    createBlockButton('Remove Block (X)', 'X');
    
    // Joint buttons
    createJointButton('Add Joint (J)', 'J');
    createJointButton('Remove Joint (Z)', 'Z');
    
    // Controller buttons
    createControllerButton('Add Controller (C)', 'C');
    createControllerButton('Remove Controller (V)', 'V');
    
    // Save/Load buttons
    createButton('Save Vehicle').mousePressed(() => StorageUtils.saveVehicle());
    createButton('Load Vehicle').mousePressed(() => StorageUtils.loadVehicle());
}

function createModeButton(label, mode, key) {
    const btn = createButton(label);
    btn.mousePressed(() => gameManager.setGameMode(mode));
    btn.class('mode-button');
}

function createBlockButton(label, key) {
    const btn = createButton(label);
    btn.mousePressed(() => handleBlockKey(key));
    btn.class('block-button');
}

function createJointButton(label, key) {
    const btn = createButton(label);
    btn.mousePressed(() => handleJointKey(key));
    btn.class('joint-button');
}

function createControllerButton(label, key) {
    const btn = createButton(label);
    btn.mousePressed(() => handleControllerKey(key));
    btn.class('controller-button');
}

function draw() {
    gameManager.update();
}

function keyPressed() {
    if (key === 'P') gameManager.setGameMode("play");
    if (key === 'B') gameManager.setGameMode("build");
    if (key === 'D') gameManager.physicsManager.enableDebugMode();

    handleBlockKey(key);
    handleJointKey(key);
    handleControllerKey(key);
}

function handleBlockKey(key) {
    if (key === '1') addBlock(new SquareBlock(random(100, 500), random(100, 500), 50));
    if (key === '2') addBlock(new CircleBlock(random(100, 500), random(100, 500), 50));
    if (key === 'X') removeBlock(squareBlocks.length > 0 ? squareBlocks.pop() : circleBlocks.pop());
}

function handleJointKey(key) {
    if (key === 'J' && squareBlocks.length >= 2) {
        let blockA = squareBlocks[squareBlocks.length - 2];
        let blockB = squareBlocks[squareBlocks.length - 1];
        let joint = new Joint(blockA, blockB, blockA.attachmentPoints[0], blockB.attachmentPoints[0], true);
        addJoint(joint, true);
    }
    if (key === 'Z' && maskingJoints.length > 0) removeJoint(maskingJoints.pop());
}

function handleControllerKey(key) {
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
        this.sideNum = sideNum;
    }

    draw() {
        push();
        fill(255, 0, 0);
        noStroke();
        ellipse(this.x, this.y, 8, 8);
        pop();
    }
}

class BaseBlock {
    constructor(typeOfBlock, x, y, blockSize) {
        this.typeOfBlock = typeOfBlock;
        this.x = x;
        this.y = y;
        this.blockSize = blockSize;
        this.attachmentPoints = this.calculateAttachmentPoints();
        this.isSelected = false;
        
        // Create Matter.js body
        this.body = this.createBody();
    }

    createBody() {
        const options = {
            friction: 0.3,
            restitution: 0.6
        };
        
        if (this.typeOfBlock === "rectangle") {
            return Matter.Bodies.rectangle(this.x, this.y, this.blockSize, this.blockSize, options);
        } else {
            return Matter.Bodies.circle(this.x, this.y, this.blockSize / 2, options);
        }
    }

    calculateAttachmentPoints() {
        return [];
    }

    contains(x, y) {
        if (this.typeOfBlock === "rectangle") {
            return x > this.x - this.blockSize/2 &&
                   x < this.x + this.blockSize/2 &&
                   y > this.y - this.blockSize/2 &&
                   y < this.y + this.blockSize/2;
        } else {
            const distance = dist(x, y, this.x, this.y);
            return distance < this.blockSize/2;
        }
    }

    getNearestAttachment(x, y) {
        let nearest = null;
        let minDist = Infinity;
        
        for (let point of this.attachmentPoints) {
            const d = dist(x, y, point.x + this.x, point.y + this.y);
            if (d < minDist) {
                minDist = d;
                nearest = point;
            }
        }
        
        return nearest;
    }
}

class SquareBlock extends BaseBlock {
    constructor(x, y, blockSize) {
        super("rectangle", x, y, blockSize);
    }

    calculateAttachmentPoints() {
        let points = [];
        let step = this.blockSize / 2;
        
        // Add attachment points on each side
        points.push(new AttachmentPoint(0, -step, 0)); // Top
        points.push(new AttachmentPoint(step, 0, 1));  // Right
        points.push(new AttachmentPoint(0, step, 2));  // Bottom
        points.push(new AttachmentPoint(-step, 0, 3)); // Left
        
        return points;
    }

    draw() {
        push();
        translate(this.body.position.x, this.body.position.y);
        rotate(this.body.angle);
        
        // Draw block
        fill(150);
        stroke(0);
        rectMode(CENTER);
        rect(0, 0, this.blockSize, this.blockSize);
        
        // Draw attachment points if selected
        if (this.isSelected) {
            this.attachmentPoints.forEach(point => point.draw());
        }
        
        pop();
    }
}

class CircleBlock extends BaseBlock {
    constructor(x, y, blockSize) {
        super("circle", x, y, blockSize);
    }

    calculateAttachmentPoints() {
        let points = [];
        let radius = this.blockSize / 2;
        
        points.push(new AttachmentPoint(0, -radius, 0));  // Top
        points.push(new AttachmentPoint(radius, 0, 1));   // Right
        points.push(new AttachmentPoint(0, radius, 2));   // Bottom
        points.push(new AttachmentPoint(-radius, 0, 3));  // Left
        points.push(new AttachmentPoint(0, 0, 4));        // Center
        
        return points;
    }

    draw() {
        push();
        translate(this.body.position.x, this.body.position.y);
        rotate(this.body.angle);
        
        // Draw block
        fill(150);
        stroke(0);
        ellipse(0, 0, this.blockSize);
        
        // Draw attachment points if selected
        if (this.isSelected) {
            this.attachmentPoints.forEach(point => point.draw());
        }
        
        pop();
    }
}



class BaseController {
    constructor(type, joint) {
        this.type = type;
        this.joint = joint;
        this.active = false;
    }

    apply() {
        const rotationSpeed = 0.05;
        
        if (this.type === "rotateCW" && keyIsDown(68)) { // D key
            Matter.Body.rotate(this.joint.blockA.body, rotationSpeed);
        }
        if (this.type === "rotateCCW" && keyIsDown(65)) { // A key
            Matter.Body.rotate(this.joint.blockA.body, -rotationSpeed);
        }
    }
}


class Joint {
    constructor(blockA, blockB, attachmentA, attachmentB, isMasking = false) {
        this.blockA = blockA;
        this.blockB = blockB;
        this.attachmentA = attachmentA;
        this.attachmentB = attachmentB;
        this.isMasking = isMasking;

        this.constraint = Matter.Constraint.create({
            bodyA: blockA.body,
            bodyB: blockB.body,
            pointA: { x: attachmentA.x, y: attachmentA.y },
            pointB: { x: attachmentB.x, y: attachmentB.y },
            stiffness: 1,
            damping: 0.1
        });

        Matter.World.add(world, this.constraint);

        if (isMasking) {
            // Fix: Correctly set collision group
            blockA.body.collisionFilter.group = -1;
            blockB.body.collisionFilter.group = -1;
        }
    }
    
    
    draw() {
        push();
        stroke(this.isMasking ? color(255, 0, 0) : color(0, 0, 255));
        strokeWeight(2);
        
        const posA = this.blockA.body.position;
        const posB = this.blockB.body.position;
        
        line(
            posA.x + this.attachmentA.x,
            posA.y + this.attachmentA.y,
            posB.x + this.attachmentB.x,
            posB.y + this.attachmentB.y
        );
        pop();
    }
}

// Add new UI Manager class
class AttachmentUI {
    constructor() {
        this.visible = false;
        this.selectedBlockA = null;
        this.selectedBlockB = null;
        this.selectedAttachmentA = null;
        this.selectedAttachmentB = null;
        this.createUI();
    }

    createUI() {
        // Create UI container
        this.container = createElement('div');
        this.container.id('attachment-ui');
        this.container.style('position', 'absolute');
        this.container.style('right', '20px');
        this.container.style('top', '20px');
        this.container.style('background', 'rgba(0,0,0,0.8)');
        this.container.style('padding', '15px');
        this.container.style('border-radius', '8px');
        this.container.style('display', 'none');
        this.container.style('color', 'white');

        // Title
        this.title = createElement('h3', 'Attachment Points');
        this.title.parent(this.container);
        this.title.style('margin', '0 0 10px 0');
        this.title.style('color', 'white');

        // Instructions
        this.instructions = createElement('p', 'Select two blocks and their attachment points');
        this.instructions.parent(this.container);
        this.instructions.style('margin-bottom', '10px');

        // Block A UI
        this.blockALabel = createElement('p', 'Block A Attachment:');
        this.blockALabel.parent(this.container);
        this.blockASelect = createSelect();
        this.blockASelect.parent(this.container);
        this.blockASelect.style('width', '100%');
        this.blockASelect.style('margin-bottom', '10px');
        
        // Block B UI
        this.blockBLabel = createElement('p', 'Block B Attachment:');
        this.blockBLabel.parent(this.container);
        this.blockBSelect = createSelect();
        this.blockBSelect.parent(this.container);
        this.blockBSelect.style('width', '100%');
        this.blockBSelect.style('margin-bottom', '10px');

        // Masking checkbox
        this.maskingCheck = createCheckbox('Masking Joint', false);
        this.maskingCheck.parent(this.container);
        this.maskingCheck.style('margin-bottom', '10px');

        // Create Joint button
        this.createJointBtn = createButton('Create Joint');
        this.createJointBtn.parent(this.container);
        this.createJointBtn.style('width', '100%');
        this.createJointBtn.mousePressed(() => this.createJoint());
    }

    show() {
        this.container.style('display', 'block');
        this.visible = true;
    }

    hide() {
        this.container.style('display', 'none');
        this.visible = false;
    }

    updateBlockA(block) {
        this.selectedBlockA = block;
        this.blockASelect.remove();
        this.blockASelect = createSelect();
        this.blockASelect.parent(this.container);
        this.blockASelect.style('width', '100%');
        this.blockASelect.style('margin-bottom', '10px');
        
        if (block) {
            block.attachmentPoints.forEach((point, index) => {
                this.blockASelect.option(`Point ${index} (${point.sideNum})`, index);
            });
        }
    }

    updateBlockB(block) {
        this.selectedBlockB = block;
        this.blockBSelect.remove();
        this.blockBSelect = createSelect();
        this.blockBSelect.parent(this.container);
        this.blockBSelect.style('width', '100%');
        this.blockBSelect.style('margin-bottom', '10px');
        
        if (block) {
            block.attachmentPoints.forEach((point, index) => {
                this.blockBSelect.option(`Point ${index} (${point.sideNum})`, index);
            });
        }
    }

    createJoint() {
        if (!this.selectedBlockA || !this.selectedBlockB) {
            console.log('Select both blocks first');
            return;
        }

        const attachmentA = this.selectedBlockA.attachmentPoints[this.blockASelect.value()];
        const attachmentB = this.selectedBlockB.attachmentPoints[this.blockBSelect.value()];
        
        const joint = new Joint(
            this.selectedBlockA,
            this.selectedBlockB,
            attachmentA,
            attachmentB,
            this.maskingCheck.checked()
        );

        addJoint(joint, this.maskingCheck.checked());
        this.hide();
    }
}

// Add Controller UI class
class ControllerUI {
    constructor() {
        this.visible = false;
        this.selectedJoint = null;
        this.createUI();
    }

    createUI() {
        this.container = createElement('div');
        this.container.id('controller-ui');
        this.container.style('position', 'absolute');
        this.container.style('right', '20px');
        this.container.style('top', '20px');
        this.container.style('background', 'rgba(0,0,0,0.8)');
        this.container.style('padding', '15px');
        this.container.style('border-radius', '8px');
        this.container.style('display', 'none');
        this.container.style('color', 'white');

        // Title
        this.title = createElement('h3', 'Controller Setup');
        this.title.parent(this.container);
        this.title.style('margin', '0 0 10px 0');
        this.title.style('color', 'white');

        // Controller type selection
        this.typeLabel = createElement('p', 'Controller Type:');
        this.typeLabel.parent(this.container);
        this.typeSelect = createSelect();
        this.typeSelect.parent(this.container);
        this.typeSelect.style('width', '100%');
        this.typeSelect.style('margin-bottom', '10px');
        
        // Add controller types
        this.typeSelect.option('Rotate Clockwise', 'rotateCW');
        this.typeSelect.option('Rotate Counter-Clockwise', 'rotateCCW');

        // Key binding selection
        this.keyLabel = createElement('p', 'Control Key:');
        this.keyLabel.parent(this.container);
        this.keyInput = createInput('');
        this.keyInput.parent(this.container);
        this.keyInput.style('width', '100%');
        this.keyInput.style('margin-bottom', '10px');

        // Create Controller button
        this.createBtn = createButton('Create Controller');
        this.createBtn.parent(this.container);
        this.createBtn.style('width', '100%');
        this.createBtn.mousePressed(() => this.createController());
    }

    show(joint) {
        this.selectedJoint = joint;
        this.container.style('display', 'block');
        this.visible = true;
    }

    hide() {
        this.container.style('display', 'none');
        this.visible = false;
    }

    createController() {
        if (!this.selectedJoint) return;

        const controller = new BaseController(
            this.typeSelect.value(),
            this.selectedJoint
        );

        addController(controller);
        this.hide();
    }
}


class Platform {
    constructor() {
        const options = {
            isStatic: true,
            friction: 0.3
        };

        // Create main platform
        this.body = Matter.Bodies.rectangle(
            CANVAS_WIDTH / 2,
            CANVAS_HEIGHT - 30,
            CANVAS_WIDTH,
            60,
            options
        );

        // Add some obstacles/ramps
        this.ramp1 = Matter.Bodies.rectangle(
            CANVAS_WIDTH * 0.7,
            CANVAS_HEIGHT - 100,
            200,
            20,
            {
                isStatic: true,
                angle: Math.PI * 0.1,
                friction: 0.3
            }
        );

        this.ramp2 = Matter.Bodies.rectangle(
            CANVAS_WIDTH * 0.3,
            CANVAS_HEIGHT - 150,
            200,
            20,
            {
                isStatic: true,
                angle: -Math.PI * 0.15,
                friction: 0.3
            }
        );

        // Add all bodies to the world
        Matter.World.add(world, [this.body, this.ramp1, this.ramp2]);
    }

    draw() {
        push();
        
        // Draw main platform
        fill(128);
        stroke(0);
        strokeWeight(2);
        
        this.drawBody(this.body);

        // Draw ramps
        fill(150, 75, 0);
        this.drawBody(this.ramp1);
        this.drawBody(this.ramp2);

        pop();
    }

    drawBody(body) {
        beginShape();
        for (let vert of body.vertices) {
            vertex(vert.x, vert.y);
        }
        endShape(CLOSE);
    }

    remove() {
        Matter.World.remove(world, [this.body, this.ramp1, this.ramp2]);
    }
}

class GameManager {
    constructor() {
        this.mode = "build";
        this.selectedBlock = null;
        this.debug = false;
        
        // Initialize managers
        this.inputHandler = new InputHandler(this);
        this.physicsManager = new PhysicsManager(this);
        this.attachmentUI = new AttachmentUI();
        this.controllerUI = new ControllerUI();
    }
    
    
    setGameMode(mode) {
        this.mode = mode;
        if (mode === "play") {
            this.physicsManager.enablePhysics();
            // Create platform in play mode
            platform = new Platform();
        } else {
            this.physicsManager.disablePhysics();
            // Remove platform in build mode
            if (platform) {
                platform.remove();
                platform = null;
            }
        }
    }

    // Modify the render method to include platform rendering
    render() {
        background(51);
        
        // Draw platform in play mode
        if (this.mode === "play" && platform) {
            platform.draw();
        }
        
        // Draw blocks
        [...squareBlocks, ...circleBlocks].forEach(block => block.draw());
        
        // Draw joints
        [...maskingJoints, ...nonMaskingJoints].forEach(joint => joint.draw());
        
        // Debug rendering
        if (this.debug) {
            this.renderDebug();
        }
    }
    
    
    handleBlockSelection(block) {
        if (!this.attachmentUI.selectedBlockA) {
            this.attachmentUI.updateBlockA(block);
            this.attachmentUI.show();
        } else if (!this.attachmentUI.selectedBlockB) {
            this.attachmentUI.updateBlockB(block);
        }
    }

    // Add method to handle joint selection
    handleJointSelection(joint) {
        this.controllerUI.show(joint);
    }

    

    update() {
        if (this.mode === "play") {
            Matter.Engine.update(engine);
        }
        
        this.render();
        this.processControllers();
    }

    
    renderDebug() {
        const bodies = Matter.Composite.allBodies(world);
        
        push();
        stroke(0, 255, 0);
        strokeWeight(1);
        noFill();
        
        for (let body of bodies) {
            beginShape();
            for (let vertex of body.vertices) {
                vertex(vertex.x, vertex.y);
            }
            endShape(CLOSE);
        }
        pop();
    }

    processControllers() {
        controllers.forEach(controller => controller.apply());
    }
}

class InputHandler {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.mousePos = createVector(0, 0);
        
        this.setupMouseHandlers();
    }

    setupMouseHandlers() {
        // mousePressed = () => this.handleMousePressed();
        // mouseDragged = () => this.handleMouseDragged();
        // mouseReleased = () => this.handleMouseReleased();
    }

    handleMousePressed() {
        if (this.gameManager.mode !== "build") return;
        
        const clicked = this.getClickedBlock();
        if (clicked) {
            this.gameManager.selectedBlock = clicked;
            clicked.isSelected = true;
        }
    }

    handleMouseDragged() {
        if (this.gameManager.mode !== "build") return;
        
        if (this.gameManager.selectedBlock) {
            const block = this.gameManager.selectedBlock;
            Matter.Body.setPosition(block.body, {
                x: mouseX,
                y: mouseY
            });
        }
    }

    handleMouseReleased() {
        if (this.gameManager.selectedBlock) {
            this.gameManager.selectedBlock.isSelected = false;
            this.gameManager.selectedBlock = null;
        }
    }

    getClickedBlock() {
        return [...squareBlocks, ...circleBlocks].find(block =>
            block.contains(mouseX, mouseY)
        );
    }
}

class PhysicsManager {
    constructor(gameManager) {
        this.gameManager = gameManager;
    }

    enablePhysics() {
        world.gravity.y = 0.8; // Reduced gravity for better gameplay
        
        // Reset positions of all bodies to prevent them from being stuck in the platform
        const bodies = Matter.Composite.allBodies(world);
        bodies.forEach(body => {
            if (!body.isStatic) {
                Matter.Body.setPosition(body, {
                    x: body.position.x,
                    y: Math.min(body.position.y, CANVAS_HEIGHT - 200) // Ensure bodies start above platform
                });
                Matter.Body.setVelocity(body, { x: 0, y: 0 });
                Matter.Body.setAngularVelocity(body, 0);
            }
        });
    }

    disablePhysics() {
        world.gravity.y = 0;
        
        // Reset all velocities
        const bodies = Matter.Composite.allBodies(world);
        bodies.forEach(body => {
            Matter.Body.setVelocity(body, { x: 0, y: 0 });
            Matter.Body.setAngularVelocity(body, 0);
        });
    }
    
    

    enableDebugMode() {
        this.gameManager.debug = !this.gameManager.debug;
    }
    
}



// Adding the remaining utility classes and helper functions to the previous code...

class StorageUtils {
    static saveVehicle() {
        const data = {
            blocks: {
                square: squareBlocks.map(block => ({
                    x: block.x,
                    y: block.y,
                    size: block.blockSize
                })),
                circle: circleBlocks.map(block => ({
                    x: block.x,
                    y: block.y,
                    size: block.blockSize
                }))
            },
            joints: maskingJoints.map(joint => ({
                blockAIndex: squareBlocks.indexOf(joint.blockA),
                blockBIndex: squareBlocks.indexOf(joint.blockB),
                attachmentA: {
                    x: joint.attachmentA.x,
                    y: joint.attachmentA.y,
                    sideNum: joint.attachmentA.sideNum
                },
                attachmentB: {
                    x: joint.attachmentB.x,
                    y: joint.attachmentB.y,
                    sideNum: joint.attachmentB.sideNum
                },
                isMasking: joint.isMasking
            }))
        };

        localStorage.setItem('vehicleData', JSON.stringify(data));
        console.log('Vehicle saved successfully!');
    }

    static loadVehicle() {
        const savedData = localStorage.getItem('vehicleData');
        if (!savedData) {
            console.log('No saved vehicle found!');
            return;
        }

        // Clear existing objects
        clearAllObjects();

        const data = JSON.parse(savedData);

        // Recreate blocks
        data.blocks.square.forEach(blockData => {
            const block = new SquareBlock(blockData.x, blockData.y, blockData.size);
            addBlock(block);
        });

        data.blocks.circle.forEach(blockData => {
            const block = new CircleBlock(blockData.x, blockData.y, blockData.size);
            addBlock(block);
        });

        // Recreate joints
        data.joints.forEach(jointData => {
            const blockA = squareBlocks[jointData.blockAIndex];
            const blockB = squareBlocks[jointData.blockBIndex];
            
            if (blockA && blockB) {
                const attachmentA = new AttachmentPoint(
                    jointData.attachmentA.x,
                    jointData.attachmentA.y,
                    jointData.attachmentA.sideNum
                );
                
                const attachmentB = new AttachmentPoint(
                    jointData.attachmentB.x,
                    jointData.attachmentB.y,
                    jointData.attachmentB.sideNum
                );

                const joint = new Joint(blockA, blockB, attachmentA, attachmentB, jointData.isMasking);
                addJoint(joint, jointData.isMasking);
            }
        });

        console.log('Vehicle loaded successfully!');
    }
}

// Helper functions
function clearAllObjects() {
    // Remove all bodies from the world
    Matter.World.clear(world, false);
    
    // Clear arrays
    squareBlocks = [];
    circleBlocks = [];
    maskingJoints = [];
    nonMaskingJoints = [];
    controllers = [];
}

function addBlock(block) {
    Matter.World.add(world, block.body);
    
    if (block instanceof SquareBlock) {
        squareBlocks.push(block);
    } else if (block instanceof CircleBlock) {
        circleBlocks.push(block);
    }
}

function removeBlock(block) {
    if (!block) return;
    
    Matter.World.remove(world, block.body);
    
    if (block instanceof SquareBlock) {
        const index = squareBlocks.indexOf(block);
        if (index !== -1) squareBlocks.splice(index, 1);
    } else if (block instanceof CircleBlock) {
        const index = circleBlocks.indexOf(block);
        if (index !== -1) circleBlocks.splice(index, 1);
    }
    
    // Remove associated joints
    removeAssociatedJoints(block);
}

function removeAssociatedJoints(block) {
    const jointsToRemove = [...maskingJoints, ...nonMaskingJoints].filter(
        joint => joint.blockA === block || joint.blockB === block
    );
    
    jointsToRemove.forEach(joint => removeJoint(joint));
}

function addJoint(joint, masking = false) {
    if (masking) {
        maskingJoints.push(joint);
    } else {
        nonMaskingJoints.push(joint);
    }
}

function removeJoint(joint) {
    if (!joint) return;
    
    Matter.World.remove(world, joint.constraint);
    
    const maskingIndex = maskingJoints.indexOf(joint);
    if (maskingIndex !== -1) {
        maskingJoints.splice(maskingIndex, 1);
        return;
    }
    
    const nonMaskingIndex = nonMaskingJoints.indexOf(joint);
    if (nonMaskingIndex !== -1) {
        nonMaskingJoints.splice(nonMaskingIndex, 1);
    }
}

function addController(controller) {
    if (controller) {
        controllers.push(controller);
    }
}

function removeController(controller) {
    if (!controller) return;
    
    const index = controllers.indexOf(controller);
    if (index !== -1) {
        controllers.splice(index, 1);
    }
}

// document.head.appendChild(style);

// Add this HTML structure to your index.html
/*
<!DOCTYPE html>
<html>
<head>
    <title>Vehicle Builder Game</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.18.0/matter.min.js"></script>
</head>
<body>
    <div id="game-container"></div>
    <script src="index.js"></script>
</body>
</html>
*/