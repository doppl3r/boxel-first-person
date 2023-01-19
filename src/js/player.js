import { Group, PerspectiveCamera } from 'three';
import { Body } from './body';

class Player extends Group {
    constructor() {
        super();
        this.body = new Body();
        this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 4000);
        this.camera.up.set(0, 0, 1); // z-up
        this.camera.position.set(0, -4, 4);
        this.camera.lookAt(0, 0, 0);
        this.add(this.camera);
    }

    update(delta, alpha, interval) {
        
    }
}

export { Player };