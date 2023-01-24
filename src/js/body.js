import { Raycaster, Vector3 } from 'three';

class Body {
    constructor() {
        this.radius = 2;
        this.raycaster = new Raycaster();
        this.rays = [
			{ name: 'top', direction: { x: 0, y: 0, z: 1 }}, { name: 'bottom', direction: { x: 0, y: 0, z: -1 }},
			{ name: 'left', direction: { x: -1, y: 0, z: 0 }}, { name: 'right', direction: { x: 1, y: 0, z: 0 }},
			{ name: 'front', direction: { x: 0, y: 1, z: 0 }}, { name: 'back', direction: { x: 0, y: -1, z: 0 }}
		];
        this.vector = new Vector3(); // Used for vector math
        this.velocity = new Vector3();
        this.position = new Vector3();
        this.positionPrev = new Vector3();
		this.gravity = 9.8;
		this.damping = 0.9;
		this.scalar = 1;
        this.noclip = false;
    }

    update(delta) {
		if (this.world) {
			// Correct delta with world tick rate
			this.scalar = delta / this.world.tick;

			// Add gravity
			if (this.noclip == false) {
				this.velocity.z -= this.gravity * this.scalar * 0.005;
			}

			// Apply movement damping
			this.velocity.multiplyScalar(Math.pow(this.damping, this.scalar));
	
			// Update positions
			this.positionPrev.copy(this.position); // Store old "next" position
			this.position.add(this.velocity); // Store new "next" position
	
			// Check collisions
			if (this.noclip == false) {
				var collisions = this.checkCollisions(this.world);
				
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
    }

    applyImpulse(impulse) {
		if (this.world) {
			// Convert impulse to Vector3 is needed
			if (impulse.isVector3 != true) impulse = new Vector3().copy(impulse);
			
			// Correct delta with world tick rate
			impulse.multiplyScalar(this.scalar);
			this.velocity.add(impulse);
		}
    }

    checkCollisions(objects) {
		var contacts = {};
		if (this.direction) {
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
		}
		return contacts;
	}
}

export { Body };