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
