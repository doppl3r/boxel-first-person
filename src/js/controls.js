import { Euler, Raycaster, Vector3 } from 'three';

class Controls {
	constructor(target, scene, domElement) {
		this.domElement = domElement;
		this.locked = false;
		this.target = target;
		this.scene = scene;
		this.direction = new Euler(0, 0, 0, 'ZYX'); // z-up order
		this.velocity = new Vector3();
		this.radius = 1;
		this.vector = new Vector3();
		this.raycaster = new Raycaster();
		this.rays = [
			{ name: 'top', direction: { x: 0, y: 0, z: 1 }}, { name: 'bottom', direction: { x: 0, y: 0, z: -1 }},
			{ name: 'left', direction: { x: -1, y: 0, z: 0 }}, { name: 'right', direction: { x: 1, y: 0, z: 0 }},
			{ name: 'front', direction: { x: 0, y: 1, z: 0 }}, { name: 'back', direction: { x: 0, y: -1, z: 0 }}
		];
		this.keys = {};
		this.mouse = { old: new Vector3(), new: new Vector3() };
		this.speed = { delta: 0, look: 1, acceleration: 0.05, max: 0.25, damp: 0.5, gravity: 9.8 };
		this.position = this.target.position.clone();
		this.positionPrev = this.position.clone();
		this.noclip = false;

		// Connect mouse controls
		this.connect();
	}

	update(delta = 1 / 60, alpha = 1) {
		if (this.isLooking()) {
			// Update target rotation
			this.direction.setFromQuaternion(this.target.quaternion);
			this.direction.z -= this.mouse.new.x * 0.001 * this.speed.look;
			this.direction.x -= this.mouse.new.y * 0.001 * this.speed.look;
			
			// Lock vertical rotation
			this.direction.x = Math.max(0, Math.min(Math.PI, this.direction.x));
	
			// Apply target from Euler
			this.target.quaternion.setFromEuler(this.direction);
			this.direction.x = 0; // Normalize movement direction speed by looking down
			this.mouse.new.set(0, 0, 0); // Reset movement delta
		}

		// Update physics
		if (alpha == 1) {
			// Add acceleration
			if (this.keys['KeyW'] == true) this.velocity.y += this.speed.acceleration;
			if (this.keys['KeyS'] == true) this.velocity.y -= this.speed.acceleration;
			if (this.keys['KeyD'] == true) this.velocity.x += this.speed.acceleration;
			if (this.keys['KeyA'] == true) this.velocity.x -= this.speed.acceleration;
			if (this.keys['ControlLeft'] == true) {
				if (this.noclip == true) this.velocity.z -= this.speed.acceleration;
			}
			if (this.keys['Space'] == true) {
				if (this.noclip == true) this.velocity.z += this.speed.acceleration;
			}

			// Add gravity
			this.velocity.z -= this.speed.gravity * 0.005;

			if (this.keys['Space'] == true) {
				this.keys['Space'] = false;
				this.velocity.z += this.speed.gravity * 0.05;
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
			this.positionPrev.copy(this.position); // Used for moving smoothly
			this.position.add(this.velocity.clone().applyEuler(this.direction));
			this.target.position.copy(this.positionPrev);

			// Check collisions
			if (this.noclip == false) {
				var collisions = this.checkCollisions();
				
				if (collisions['bottom']) {
					this.velocity.z = 0;
					this.position.z = collisions['bottom'].point.z + this.radius;
				}
				if (collisions['front']) {
					var collision = collisions['front'];
					var object = collision.object;
					var normal = collision.face.normal.clone().transformDirection(object.matrixWorld);
					//this.velocity.cross(collisions['front'].face.normal.negate());
					//this.velocity.reflect(collisions['front'].face.normal.negate());
					//console.log('velocity: ' + JSON.stringify(this.velocity));
					//console.log('reflected: ' + JSON.stringify(this.velocity.clone().reflect(normal)));
					//console.log('normal: ' + JSON.stringify(normal));
					//console.log('angle: ' + JSON.stringify(this.velocity.clone().angleTo(normal)));
					//console.log('collision: ', collision);
					//this.velocity.set(0, 0, 0);
					//this.position.copy(collisions['front'].point);
					//this.position.add(this.velocity.clone().applyEuler(this.direction));
				}
				else {
					//console.log('pizza');
				}
			}
		}
		else {
			// Smoothly interpolate target position to controls position
			this.target.position.lerpVectors(this.positionPrev, this.position, alpha);
		}
	}

	checkCollisions() {
		var contacts = {};
		for (var i = 0; i < this.rays.length; i++) {
			var ray = this.rays[i];
			var direction = this.vector.copy(ray.direction).applyEuler(this.direction);
			this.raycaster.set(this.position, direction);
			var contact = this.raycaster.intersectObjects(this.scene.children)[0];
			if (contact) {
				if (contact.distance < this.radius) {
					contacts[ray.name] = contact;
				}
			}
		}
		return contacts;
	}

	onMouseMove(e) {
		// Cancel movement if element is not locked
		if (this.locked == false) { return };

		// Copy from new coordinates if they do not equal zero
		if (this.isLooking()) this.mouse.old.copy(this.mouse.new);
		
		// Add mouse coordinates. This allows the update function to apply input
		this.mouse.new.add({ x: e.movementX, y: e.movementY });

		// Fix Chrome jumping when mouse exits window range (known bug): 0.35% of screen width/height seems to be the sweet spot
		if (Math.abs(e.movementX) > window.innerWidth / 3 || Math.abs(e.movementY) > window.innerHeight / 3) {
			this.mouse.new.copy(this.mouse.old);
		}
	}

	isLooking() {
		return this.mouse.new.equals({ x: 0, y: 0 }) == false;		
	}

	isMoving() {
		return this.keys['KeyW'] == true || this.keys['KeyD'] == true || this.keys['KeyS'] == true || this.keys['KeyA'] == true;
	}

	isGrounded() {
		var grounded = false;

		// TODO: Check scene
		return grounded;
	}

	onKeyDown(e) {
		if (e.repeat) return;
		this.keys[e.code] = true;
	}

	onKeyUp(e) {
		this.keys[e.code] = false;
	}

	lock() {
		this.domElement.requestPointerLock();
	}
	
	unlock() {
		this.domElement.ownerDocument.exitPointerLock();
	}

	onPointerlockChange() {
		if (this.domElement.ownerDocument.pointerLockElement === this.domElement) {
			this.locked = true;
		}
		else {
			this.locked = false;
		}
	}

	connect() {
		var _this = this;
		this.domElement.ownerDocument.addEventListener('mousemove', function(e) { _this.onMouseMove(e); });
		this.domElement.ownerDocument.addEventListener('pointerlockchange', function(e) { _this.onPointerlockChange(e); });
		this.domElement.ownerDocument.addEventListener('keyup', function(e) { _this.onKeyUp(e); });
		this.domElement.ownerDocument.addEventListener('keydown', function(e) { _this.onKeyDown(e); });
	}

	disconnect() {
		this.domElement.ownerDocument.removeEventListener('mousemove', function(e) { _this.onMouseMove(e); });
		this.domElement.ownerDocument.removeEventListener('pointerlockchange', function(e) { _this.onPointerlockChange(e); });
		this.domElement.ownerDocument.removeEventListener('keyup', function(e) { _this.onKeyUp(e); });
		this.domElement.ownerDocument.removeEventListener('keydown', function(e) { _this.onKeyDown(e); });
	}
}

export { Controls };