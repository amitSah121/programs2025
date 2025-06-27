

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
