import { Color, Fog, HemisphereLight, Scene } from 'three';
import { Body, Box, Material, Vec3, World } from 'cannon-es';
import CannonDebugger from 'cannon-es-debugger';
import { Background } from './background.js';
import { Player } from './player';

class Dungeon extends Scene {
    constructor() {
        super();
        this.name = 'Dungeon';
        this.player = new Player();
        this.background = new Background();
        this.fog = new Fog(new Color('#ffffff'), 50, 100);
        this.world = new World({ allowSleep: true, gravity: new Vec3(0, 0, -9.82) });
        this.debugger = new CannonDebugger(this, this.world, { color: '#00ff00', scale: 1 });
        this.debug = false;
    }

    init(app) {
        // Add player and assign app camera to player camera
        this.add(this.player);
        app.camera = this.player.camera;

        // Add controls
        app.controls.connect(document.body);
        app.controls.bind(this.player);

        // Add background and bind to player position
        this.background.scale.multiplyScalar(this.player.camera.far * 0.9);
        this.background.bind(this.player);
        this.add(this.background);

        // Add temporary floor for testing
        var rows = 16;
        var cols = 16;
        for (var col = 0; col < cols; col++) {
            for (var row = 0; row < rows; row++) {
                var model = app.assets.models.clone('grass-fairway');
                var x = Math.floor(col - (cols / 2));
                var y = Math.floor(row - (rows / 2));
                model.position.set(x, y, 0);
                model.body = new Body({
                    mass: 0,
                    shape: new Box(new Vec3(0.5, 0.5, 0.5)),
                    material: new Material({ friction: 0.25, restitution: 0.05 }),
                    position: model.position,
                    quaternion: model.quaternion
                });
                this.add(model);
            }
        }

        // Add test cube
        var model = app.assets.models.clone('grass-fairway');
        model.position.set(0, 0, 1);
        model.rotation.set(0, 0, Math.PI / 8);
        model.body = new Body({
            mass: 1,
            shape: new Box(new Vec3(0.5, 0.5, 0.5)),
            material: new Material({ friction: 0.1, restitution: 0.05 }),
            position: model.position,
            quaternion: model.quaternion
        });
        this.add(model);

        // Add basic environment light
        var hemisphere = new HemisphereLight('#ffffff', '#000000', 1);
        hemisphere.position.set(0, -1, 2);
        this.add(hemisphere);
    }

    add(object) {
        if (object.body) this.world.addBody(object.body);
        super.add(object);
    }

    updateRender(delta, alpha) {
        // Update children 3D objects
        for (var i = 0; i < this.children.length; i++) {
            var child = this.children[i];

            // Update 3D object to rigid body position
            if (child.update) {
                child.update(delta, alpha);
            }

            // Update animations
            if (child.animation) {
                child.animation.update(delta);
            }
        }
    }

    updatePhysics(delta, alpha) {
        // Update children physics
        for (var i = 0; i < this.children.length; i++) {
            var child = this.children[i];

            // Update 3D object physics
            if (child.updatePhysics) {
                child.updatePhysics(delta, alpha);
            }
        }

        // Step world
        this.world.step(delta);
        if (this.debug) this.debugger.update();
    }
}

export { Dungeon };