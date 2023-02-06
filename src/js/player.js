import { Group, PerspectiveCamera, Raycaster, Vector3 } from 'three';
import { Body, Sphere, Material } from 'cannon-es';

class Player extends Group {
    constructor() {
        super();
        this.name = 'Player';
        this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 100);
        this.camera.up.set(0, 0, 1);
        this.camera.rotation.set(Math.PI / 2, 0, 0); // Look at horizon
        this.position.set(0, -3, 1.5);
        this.height = 1;
        this.radius = 0.5;
        this.body = new Body({
            allowSleep: true,
            angularDamping: 1,
			fixedRotation: false,
			linearDamping: 0.05,
			mass: 1,
			material: new Material({ friction: -1, restitution: -1 }),
			position: this.position,
			shape: new Sphere(this.radius), // Radius
			sleepSpeedLimit: 0.5,
			sleepTimeLimit: 0.1
        });
        this.body.addEventListener('sleep', function(e) { var body = e.target; body.fixedRotation = true; body.updateMassProperties(); });
		this.body.addEventListener('wakeup', function(e) { var body = e.target; body.fixedRotation = false; body.updateMassProperties(); });
        this.raycaster = new Raycaster(this.position, this.camera.up.negate(), 0, 10);
        this.force = new Vector3();
        this.vector = new Vector3();
        this.acceleration = 1;
        this.speed = 5;
    }

    setControls(controls) {
        this.controls = controls;
        this.controls.quaternion.copy(this.camera.quaternion);
    }

    update(delta, alpha) {
        // Interpolate model position
        this.position.lerpVectors(this.body.previousPosition, this.body.position, alpha);

        // Reposition camera to body position and height
        this.camera.quaternion.copy(this.controls.quaternion);
        this.camera.position.copy(this.position);
        this.camera.position.z += this.height;
    }

    updatePhysics(delta, alpha) {
        // Only move if camera is set from the app
        if (this.camera.isActive) {
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
                        if (this.isGrounded()) {
                            this.body.applyImpulse({ x: 0, y: 0, z: 5 * this.body.mass });
                        }
                    }
                }
    
                // Apply directional velocity to body
                if (this.force.length() != 0) {
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
                    this.body.angularDamping = 1; // Grip rotation
                }
            }
        }
    }

    isGrounded() {
        var grounded = false;

        // Update ray position and cast ray
        this.raycaster.ray.origin.copy(this.body.position);
        var contact = this.raycaster.intersectObject(this.parent)[0];
        
        // Check if contact exists
        if (contact) {
            var object = contact.object;
            var radius = this.radius;

            // Search ancestors for physical body
            if (contact.distance < radius * 1.25) {
                object.traverseAncestors(function(obj) {
                    if (obj.body) {
                        grounded = true;
                    }
                });
            };
        }
        return grounded;
    }
}

export { Player };