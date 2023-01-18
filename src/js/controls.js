import { Euler, Raycaster, Vector3 } from 'three';

class Controls {
	constructor(camera, domElement) {
		this.domElement = domElement;
		this.locked = false;
		this.camera = camera;
		this.direction = new Euler(0, 0, 0, 'ZYX'); // z-up order
		this.velocity = new Vector3();
		this.rays = {
			'top': new Raycaster({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }, 0, 10),
			'bottom': new Raycaster({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: -1 }, 0, 10),
			'left': new Raycaster({ x: 0, y: 0, z: 0 }, { x: -1, y: 0, z: 0 }, 0, 10),
			'right': new Raycaster({ x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, 0, 10),
			'front': new Raycaster({ x: 0, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }, 0, 10),
			'back': new Raycaster({ x: 0, y: 0, z: 0 }, { x: 0, y: -1, z: 0 }, 0, 10)
		};
		this.keys = {};
		this.mouse = { old: new Vector3(), new: new Vector3() };
		this.speed = { delta: 0, look: 1, move: { acceleration: 0.1, max: 0.25 }};
		this.position = this.camera.position.clone();
		this.positionPrev = this.position.clone();

		// Connect mouse controls
		this.connect();
	}

	update(delta = 1 / 60, alpha = 1) {
		if (this.isLooking()) {
			// Update camera rotation
			this.direction.setFromQuaternion(this.camera.quaternion);
			this.direction.z -= this.mouse.new.x * 0.001 * this.speed.look;
			this.direction.x -= this.mouse.new.y * 0.001 * this.speed.look;
			
			// Lock vertical rotation
			this.direction.x = Math.max(0, Math.min(Math.PI, this.direction.x));
	
			// Apply camera from Euler
			this.camera.quaternion.setFromEuler(this.direction);
			this.direction.x = 0;this.direction.x = 0; // Normalize movement direction speed by looking down
			this.mouse.new.set(0, 0, 0); // Reset movement delta
		}

		// Update physics
		if (alpha == 1) {
			this.speed.delta = (this.speed.move.acceleration);

			// Add acceleration
			if (this.keys['KeyW'] == true) this.velocity.y += this.speed.delta;
			if (this.keys['KeyS'] == true) this.velocity.y -= this.speed.delta;
			if (this.keys['KeyD'] == true) this.velocity.x += this.speed.delta;
			if (this.keys['KeyA'] == true) this.velocity.x -= this.speed.delta;

			// Apply movement damping
			this.velocity.multiplyScalar(1 - this.speed.move.max);

			// Update positions
			this.positionPrev.copy(this.position); // Used for moving smoothly
			this.position.add(this.velocity.clone().applyEuler(this.direction));
			this.camera.position.copy(this.positionPrev);
		}
		else {
			// Smoothly interpolate camera position to controls position
			this.camera.position.lerpVectors(this.positionPrev, this.position, alpha);
		}
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
		this.domElement.ownerDocument.addEventListener('click', function () { _this.lock(); });
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