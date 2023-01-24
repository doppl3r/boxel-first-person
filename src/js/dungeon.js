import { Scene, HemisphereLight } from 'three';

class Dungeon extends Scene {
    constructor() {
        super();
        this.name = 'world';
        this.bodies = [];
        this.tick = 1 / 60; // Target interval
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

        // Add test cube
        var model = assets.models.clone('grass-fairway');
        model.position.set(0, 0, 2);
        model.rotation.set(0, 0, Math.PI / 8);
        this.add(model);

        // Add basic environment light
        var hemisphere = new HemisphereLight('#ffffff', '#000000', 1);
        hemisphere.position.set(0, -1, 2);
        this.add(hemisphere);
    }

    add(object) {
        if (object.body) this.addBody(object.body);
        super.add(object);
    }

    addBody(body) {
        body.index = this.bodies.length;
        this.bodies.push(body);
        body.world = this;
    }

    removeBody(body) {
        body.world = null;

        if (body.index > -1) {
            this.bodies.splice(body.index, 1);
            for (var i = 0; i !== this.bodies.length; i++) {
                this.bodies[i].index = i;
            }
        }
    }

    step(delta) { // delta = interval
        for (var i = 0; i < this.bodies.length; i++) {
            this.bodies[i].update(delta);
        }
    }

    update(delta, alpha) {
        // Update physics when alpha = 1
        for (var i = 0; i < this.children.length; i++) {
            var child = this.children[i];

            // Update 3D object to rigid body position
            if (child?.body) {
                child.update(delta, alpha);
            }

            // Update animations
            if (child.animation) {
                child.animation.update(delta);
            }
        }
    }
}

export { Dungeon };