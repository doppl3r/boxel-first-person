import { Group, PerspectiveCamera, Vector3 } from 'three';
import { Body, Sphere, Material } from 'cannon-es';

class Player extends Group {
    constructor() {
        super();
        this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 100);
        this.up.set(0, 0, 1); // Z-up
        this.position.set(0, -3, 1.5);
        this.body = new Body({
            allowSleep: true,
            angularDamping: 1,
			fixedRotation: false,
			linearDamping: 0.05,
			mass: 5,
			material: new Material({ friction: -1, restitution: -1 }),
			position: this.position,
			shape: new Sphere(1), // Radius
			sleepSpeedLimit: 0.5,
			sleepTimeLimit: 0.1
        });
        this.body.addEventListener('sleep', function(e) { var body = e.target; body.fixedRotation = true; body.updateMassProperties(); });
		this.body.addEventListener('wakeup', function(e) { var body = e.target; body.fixedRotation = false; body.updateMassProperties(); });
        this.rotation.set(Math.PI / 2, 0, 0); // Look at horizon
        this.force = new Vector3();
        this.vector = new Vector3();
        this.acceleration = 10;
        this.speed = 5;
        this.add(this.camera);
    }

    update(delta, alpha) {
        // Add controls to body
        if (this.controls) {
            this.force.set(0, 0, 0); // Reset force
            if (this.controls.keys['KeyW'] == true) this.force.y = this.acceleration;
            if (this.controls.keys['KeyS'] == true) this.force.y = -this.acceleration;
            if (this.controls.keys['KeyD'] == true) this.force.x = this.acceleration;
            if (this.controls.keys['KeyA'] == true) this.force.x = -this.acceleration;
            if (this.controls.keys['ControlLeft'] == true) { if (this.body.noclip == true) this.force.z = -this.acceleration; }
            if (this.controls.keys['Space'] == true) {
                if (this.body.noclip == true) this.force.z = this.acceleration;
                else {
                    this.controls.keys['Space'] = false;
                    this.body.applyImpulse({ x: 0, y: 0, z: 5 * this.body.mass });
                }
            }

            // Apply directional velocity to body
            if (this.controls.isMoving()) {
                this.body.angularDamping = 0.75;
                this.force.applyEuler(this.controls.direction).clampLength(-this.acceleration, this.acceleration);
                this.body.applyImpulse(this.force);

                // Clamp body velocity speed
                if (this.body.velocity.length() > this.speed) {
                    this.vector.copy(this.body.velocity);
                    this.vector.clampLength(-this.speed, this.speed);
                    this.body.velocity.x = this.vector.x;
                    this.body.velocity.y = this.vector.y;
                }
            }
            else {
                this.body.angularDamping = 1; // Grip walls
            }
        }
        
        // Interpolate model position
        this.position.lerpVectors(this.body.previousPosition, this.body.position, alpha);
    }
}

export { Player };