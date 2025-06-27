class GameManager {
    constructor() {
        this.gameMode = "build";
        this.inputHandler = new InputHandler(32);
        this.uiManager = new UIManager();
        this.physicsManager = new PhysicsManager(engine);
        this.selectedBlock = null;
        this.uiManager = new UIManager(this);
        // Add this inside the GameManager constructor (around line 8)
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

    renderBuildMode() {
        background(50);

        for (let block of squareBlocks) {
            block.draw();
        }

        for (let joint of maskingJoints) {
            joint.draw();
        }
        
        this.processControllers();

        if (this.selectedBlock) {
            for (let point of this.selectedBlock.attachmentPoints) {
                point.draw();
            }
        }
        this.highlightSelected();

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

