
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
