import { Euler, Quaternion, Raycaster, Vector3 } from 'three';

class Body {
    constructor() {
        this.radius = 1;
        this.raycaster = new Raycaster();
        this.direction = new Euler(0, 0, 0, 'ZYX'); // z-up order
        this.quaternion = new Quaternion();
        this.rays = [
			{ name: 'top', direction: { x: 0, y: 0, z: 1 }}, { name: 'bottom', direction: { x: 0, y: 0, z: -1 }},
			{ name: 'left', direction: { x: -1, y: 0, z: 0 }}, { name: 'right', direction: { x: 1, y: 0, z: 0 }},
			{ name: 'front', direction: { x: 0, y: 1, z: 0 }}, { name: 'back', direction: { x: 0, y: -1, z: 0 }}
		];
        this.vector = new Vector3(); // Used for vector math
        this.velocity = new Vector3();
        this.position = new Vector3();
        this.positionPrev = new Vector3();
        this.speed = { delta: 0, look: 1, acceleration: 0.05, max: 0.25, damp: 0.5, gravity: 9.8 };
        this.noclip = false;
    }

    update(objects) {
        if (this.noclip == false) {
			// Add gravity
			this.velocity.z -= this.speed.gravity * 0.005;
		}

		// Clamp max speed
		this.vector.copy(this.velocity).clampLength(-this.speed.max, this.speed.max)
		this.velocity.x = this.vector.x;
		this.velocity.y = this.vector.y;
		
		// Apply movement damping
		this.velocity.x *= (0.75);
		this.velocity.y *= (0.75);
		this.velocity.z *= (0.9);

		// Update positions
		this.positionPrev.copy(this.position); // Store old "next" position
		this.position.add(this.velocity.clone().applyEuler(this.direction)); // Store new "next" position

		// Check collisions
		if (this.noclip == false) {
			var collisions = this.checkCollisions(objects);
			
			if (collisions['bottom']) {
				this.velocity.z = 0;
				this.position.z = collisions['bottom'].point.z + this.radius;
			}
			if (collisions['front']) {
				var collision = collisions['front'];
				var object = collision.object;
				var normal = collision.face.normal.clone().transformDirection(object.matrixWorld);
			}
			else {
				//console.log('pizza');
			}
		}
    }

    applyImpulse(impulse) {
        this.velocity.add(impulse);
    }

    checkCollisions(objects) {
		var contacts = {};
		for (var i = 0; i < this.rays.length; i++) {
			var ray = this.rays[i];
			var direction = this.vector.copy(ray.direction).applyEuler(this.direction);
			this.raycaster.set(this.position, direction);
			var contact = this.raycaster.intersectObject(objects)[0];
			if (contact) {
				if (contact.distance < this.radius) {
					contacts[ray.name] = contact;
				}
			}
		}
		return contacts;
	}
}

export { Body };