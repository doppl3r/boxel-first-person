import { Group, PerspectiveCamera } from 'three';
import { Body } from './body';

class Player extends Group {
    constructor() {
        super();
        this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 4000);
        this.body = new Body();
        this.body.position.set(0, -8, 4);
        this.body.quaternion.setFromEuler({ x: Math.PI / 4, y: 0, z: 0 });
        this.add(this.camera);
    }

    update(delta, alpha, interval) {
        // Add controls to body
        if (alpha == 1) {
            if (this.controls) {
                if (this.controls.keys['KeyW'] == true) this.body.applyImpulse({ x: 0, y: this.body.speed.acceleration, z: 0 });
                if (this.controls.keys['KeyS'] == true) this.body.applyImpulse({ x: 0, y: -this.body.speed.acceleration, z: 0 });
                if (this.controls.keys['KeyD'] == true) this.body.applyImpulse({ x: this.body.speed.acceleration, y: 0, z: 0 });
                if (this.controls.keys['KeyA'] == true) this.body.applyImpulse({ x: -this.body.speed.acceleration, y: 0, z: 0 });
                if (this.controls.keys['ControlLeft'] == true) { if (this.body.noclip == true) this.body.applyImpulse({ x: 0, y: 0, z: -this.body.speed.acceleration }); }
                if (this.controls.keys['Space'] == true) {
                    if (this.body.noclip == true) this.body.applyImpulse({ x: 0, y: 0, z: this.body.speed.acceleration });
                    else {
                        this.controls.keys['Space'] = false;
                        this.body.applyImpulse({ x: 0, y: 0, z: this.body.speed.gravity * 0.05 });
                    }
                }
                // TODO: apply direction to velocity
            }

            // Update physical body from control input keys
            this.body.direction = this.direction;
            this.body.update(this.parent);
            this.position.copy(this.body.positionPrev);
        }
        else {
            // Copy body position
            this.position.lerpVectors(this.body.positionPrev, this.body.position, alpha);
        }

    }

    bind(controls) {
        this.controls = controls;
    }
}

export { Player };