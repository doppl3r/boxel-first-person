import { Group, PerspectiveCamera, Vector3 } from 'three';
import { Body } from './body';

class Player extends Group {
    constructor() {
        super();
        this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 4000);
        this.body = new Body();
        this.body.position.set(0, -8, 4);
        this.rotation.set(Math.PI / 2, 0, 0); // Look at horizon
        this.force = new Vector3();
        this.vector = new Vector3();
        this.add(this.camera);
    }

    update(delta, alpha, interval) {
        // Add controls to body
        if (alpha == 1) {
            if (this.controls) {
                this.force.set(0, 0, 0);
                if (this.controls.keys['KeyW'] == true) this.force.y = this.body.speed.acceleration;
                if (this.controls.keys['KeyS'] == true) this.force.y = -this.body.speed.acceleration;
                if (this.controls.keys['KeyD'] == true) this.force.x = this.body.speed.acceleration;
                if (this.controls.keys['KeyA'] == true) this.force.x = -this.body.speed.acceleration;
                if (this.controls.keys['ControlLeft'] == true) { if (this.body.noclip == true) this.force.z = -this.body.speed.acceleration; }
                if (this.controls.keys['Space'] == true) {
                    if (this.body.noclip == true) this.force.z = this.body.speed.acceleration;
                    else {
                        this.controls.keys['Space'] = false;
                        this.force.z = this.body.gravity * 0.05;
                    }
                }

                // Clamp movement speed
                this.vector.copy(this.force);
                this.vector.z = 0;
                this.vector.applyEuler(this.controls.direction).clampLength(-this.body.speed.acceleration, this.body.speed.acceleration);
                this.force.x = this.vector.x;
                this.force.y = this.vector.y;

                // Apply direction to velocity
                this.body.applyImpulse(this.force);
            }

            // Update physical body from control input keys
            this.body.direction = this.controls.direction;
            this.body.update(this.parent);
            this.position.copy(this.body.positionPrev);
        }
        else {
            // Copy body position
            this.position.lerpVectors(this.body.positionPrev, this.body.position, alpha);
        }
    }
}

export { Player };