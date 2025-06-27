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

