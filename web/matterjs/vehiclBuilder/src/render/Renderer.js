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
