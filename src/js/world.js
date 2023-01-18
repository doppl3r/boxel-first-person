import { Scene, HemisphereLight } from 'three';

class World extends Scene {
    constructor() {
        super();
    }

    init(assets) {
        // Add temporary floor for testing
        var rows = 16;
        var cols = 16;
        for (var col = 0; col < cols; col++) {
            for (var row = 0; row < rows; row++) {
                var model = assets.models.clone('grass-fairway');
                var x = Math.floor(col - (cols / 2));
                var y = Math.floor(row - (rows / 2));
                model.position.set(x, y, 0);
                this.add(model);
            }
        }

        // Add basic environment light
        var hemisphere = new HemisphereLight('#ffffff', '#000000', 1);
        hemisphere.position.set(0, -1, 2);
        this.add(hemisphere);
    }

    update(delta, alpha) {
        for (var i = 0; i < this.children.length; i++) {
            var child = this.children[i];

            // Update 3D object to rigid body position
            if (child?.body?.type == 1) {
                child.update(delta, alpha, this.debugger);
            }

            // Update animations
            if (child.animation) {
                child.animation.update(delta);
            }
        }
    }
}

export { World };