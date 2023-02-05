import { Euler, Quaternion, Vector3 } from 'three';

class Controls {
	constructor() {
		this.locked = false;
		this.mouse = { old: new Vector3(), new: new Vector3() };
		this.direction = new Euler(0, 0, 0, 'ZYX'); // z-up order
		this.quaternion = new Quaternion();
		this.sensitivity = 1;
		this.keys = {};
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

	mouseDown(e) {
		this.lock();
	}

	mouseMove(e) {
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

	mouseUp(e) {
		
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
		if (this.locked != true) {
			this.domElement.requestPointerLock();
		}
	}
	
	unlock() {
		this.locked = false;
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
		// Bind target to an Object3D
		this.target = target;
		this.target.controls = this; // Bind controls to target
		if (this.target.camera) this.quaternion.copy(this.target.camera.quaternion);
	}

	connect(domElement) {
		// Add event listener
		var _this = this;
		this.domElement = domElement || document.body;
		this.domElement.ownerDocument.addEventListener('mousedown', function (e) { _this.mouseDown(e); }, true);
		this.domElement.ownerDocument.addEventListener('mousemove', function(e) { _this.mouseMove(e); }, true);
		this.domElement.ownerDocument.addEventListener('mouseup', function(e) { _this.mouseUp(e); }, true);
		this.domElement.ownerDocument.addEventListener('pointerlockchange', function(e) { _this.onPointerlockChange(e); }, true);
		this.domElement.ownerDocument.addEventListener('keyup', function(e) { _this.onKeyUp(e); }, true);
		this.domElement.ownerDocument.addEventListener('keydown', function(e) { _this.onKeyDown(e); }, true);
	}

	disconnect() {
		this.domElement.ownerDocument.removeEventListener('mousedown', function(e) {}, true);
		this.domElement.ownerDocument.removeEventListener('mousemove', function(e) {}, true);
		this.domElement.ownerDocument.removeEventListener('mouseup', function(e) {}, true);
		this.domElement.ownerDocument.removeEventListener('pointerlockchange', function(e) {}, true);
		this.domElement.ownerDocument.removeEventListener('keyup', function(e) {}, true);
		this.domElement.ownerDocument.removeEventListener('keydown', function(e) {}, true);
	}
}

export { Controls };