import { Euler, Raycaster, Vector3 } from 'three';

class Controls {
	constructor(target, domElement) {
		this.target = target;
		this.domElement = domElement || document.body;
		this.locked = false;
		this.target.direction = new Euler(0, 0, 0, 'ZYX'); // z-up order
		this.mouse = { old: new Vector3(), new: new Vector3() };
		this.sensitivity = 1;
		this.keys = {};

		// Connect mouse controls
		this.connect();
	}

	update(delta, alpha, interval) {
		if (this.isLooking()) {
			// Update target rotation
			this.target.direction.setFromQuaternion(this.target.quaternion);
			this.target.direction.z -= this.mouse.new.x * 0.001 * this.sensitivity;
			this.target.direction.x -= this.mouse.new.y * 0.001 * this.sensitivity;
			
			// Lock vertical rotation
			this.target.direction.x = Math.max(0, Math.min(Math.PI, this.target.direction.x));
	
			// Apply target from Euler
			this.target.quaternion.setFromEuler(this.target.direction);
			this.target.direction.x = 0; // Normalize forward direction by looking down
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
		return this.mouse.new.equals({ x: 0, y: 0 }) == false;		
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