import { Group, PerspectiveCamera, Vector3 } from 'three';
import { Body } from './body';

class Player extends Group {
    constructor() {
        super();
        this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 100);
        this.body = new Body();
        this.body.position.set(0, -8, this.body.radius);
        this.rotation.set(Math.PI / 2, 0, 0); // Look at horizon
        this.force = new Vector3();
        this.vector = new Vector3();
        this.acceleration = 0.0625;
        this.add(this.camera);
    }

    update(delta, alpha, interval) {
        // Add controls to body
        if (alpha == 1) {
            if (this.controls) {
                this.force.set(0, 0, 0);
                if (this.controls.keys['KeyW'] == true) this.force.y = this.acceleration;
                if (this.controls.keys['KeyS'] == true) this.force.y = -this.acceleration;
                if (this.controls.keys['KeyD'] == true) this.force.x = this.acceleration;
                if (this.controls.keys['KeyA'] == true) this.force.x = -this.acceleration;
                if (this.controls.keys['ControlLeft'] == true) { if (this.body.noclip == true) this.force.z = -this.acceleration; }
                if (this.controls.keys['Space'] == true) {
                    if (this.body.noclip == true) this.force.z = this.acceleration;
                    else {
                        this.controls.keys['Space'] = false;
                        this.force.z = this.acceleration * 0.05 * this.body.gravity;
                    }
                }

                // Clamp movement speed
                this.vector.copy(this.force);
                this.vector.z = 0;
                this.vector.applyEuler(this.controls.direction).clampLength(-this.acceleration, this.acceleration);
                this.force.x = this.vector.x;
                this.force.y = this.vector.y;

                // Apply direction to velocity
                this.body.applyImpulse(this.force);
            }

            // Update physical body from control input keys
            this.body.direction = this.controls.direction;

            // Test position change
            if (this.time == null) this.time = 0;
            this.time += (interval * 0.1);
            this.body.positionPrev.copy(this.body.position);
            this.body.position.x = Math.sin(this.time * 5) * 5;
            this.body.position.y = Math.cos(this.time * 5) * 5;

            //this.body.update(this.parent);
            this.position.copy(this.body.positionPrev);
        }
        else {
            // Copy body position
            this.position.lerpVectors(this.body.positionPrev, this.body.position, alpha);
        }
    }
}

export { Player };