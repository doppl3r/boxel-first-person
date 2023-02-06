import { Group, PerspectiveCamera, Raycaster } from 'three';

class Editor extends Group {
    constructor() {
        super();
        this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 100);
        this.camera.up.set(0, 0, 1);
        this.camera.rotation.set(Math.PI / 2, 0, 0);
        this.raycaster = new Raycaster();
    }

    update(delta, alpha) {
        this.camera.quaternion.copy(this.controls.quaternion);
        this.camera.position.copy(this.position);
    }

    updateCursor() {
        // TODO: Update cursor to raycaster contact
    }

    addObject() {
        // TODO: Add object to cursor
    }

    removeObject() {
        // TODO: Remove object at cursor contact
    }

    setControls(controls) {
        var _this = this;
        this.controls = controls;
        this.controls.addEventListener('mousedown', function(e) {
            if (e.button == 0) _this.addObject();
            if (e.button == 2) _this.removeObject();
        });
        this.controls.addEventListener('mousemove', function(e) {
            _this.updateCursor();
        });
    }
}

export { Editor };