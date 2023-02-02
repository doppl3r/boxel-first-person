import { Euler, Quaternion, Vector3 } from 'three';

class Controls {
	constructor(target, domElement) {
		this.domElement = domElement || document.body;
		this.locked = false;
		this.mouse = { old: new Vector3(), new: new Vector3() };
		this.direction = new Euler(0, 0, 0, 'ZYX'); // z-up order
		this.quaternion = new Quaternion();
		this.sensitivity = 1;
		this.keys = {};

		// Bind controls to target
		this.bind(target);

		// Connect mouse controls
		this.connect();
	}

	update(delta, alpha) {
		if (this.isLooking()) {
			// Update direction to mouse input
			this.direction.setFromQuaternion(this.quaternion);
			this.direction.z -= this.mouse.new.x * this.sensitivity * 0.001;
			this.direction.x -= this.mouse.new.y * this.sensitivity * 0.001;
			
			// Lock vertical rotation
			this.direction.x = Math.max(0, Math.min(Math.PI, this.direction.x));
			
			// Update quaternion from Euler
			this.quaternion.setFromEuler(this.direction);

			// Set movement direction parallel to the ground
			this.direction.x = 0;
			this.mouse.new.set(0, 0, 0); // Reset movement delta
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
		return this.mouse.new.equals({ x: 0, y: 0, z: 0 }) == false;		
	}

	isMoving() {
		return this.keys['KeyW'] == true || this.keys['KeyD'] == true || this.keys['KeyS'] == true || this.keys['KeyA'] == true;
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

	bind(target) {
		this.target = target;
		this.target.controls = this; // Bind controls to target
		if (this.target.camera) this.quaternion.copy(this.target.camera.quaternion);
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