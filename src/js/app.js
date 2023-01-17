import { Clock, PerspectiveCamera, PCFSoftShadowMap, Scene, Vector3, WebGLRenderer } from 'three';
import { Assets } from './assets';
import Stats from './stats.js';

class App {
    constructor() {
        var _this = this;
        this.clock = new Clock();
        this.clock.scale = 1;
        this.physicsDeltaSum = 0;
        this.physicsTickRate = 30; // Calculations per second
        this.physicsInterval = 1 / this.physicsTickRate;
        this.renderDeltaSum = 0;
        this.renderTickRate = -1; // Ex: 24 = 24fps, -1 = unlimited
        this.renderInterval = 1 / this.renderTickRate;
        this.stats = new Stats();
        this.assets = new Assets();
        this.scene = new Scene();
        this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 4000);
        this.camera.up.set(0, 0, 1); // z-up
        this.renderer = new WebGLRenderer({ antialias: true, alpha: false });
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = PCFSoftShadowMap;

        // Append renderer to canvas
        document.body.appendChild(this.renderer.domElement);
        document.body.appendChild(this.stats.dom);

        // Resize window
        this.resizeWindow();

        // Initialize app after loading assets
        this.assets.load(function() {
            _this.init();
            _this.renderer.setAnimationLoop(function() { _this.update(); });
        });
    }

    init() {
        console.log('initialized');
    }

    update() {
        // Update time factors
        var delta = this.clock.getDelta() * this.clock.scale;
        var alpha = this.physicsDeltaSum / this.physicsInterval; // Interpolation factor
        
        // Update engine on a lessor interval (improves performance)
        this.physicsDeltaSum += delta;
        if (this.physicsDeltaSum > this.physicsInterval) {
            this.physicsDeltaSum %= this.physicsInterval; // reset with remainder
            this.updatePhysics(this.physicsInterval);
            alpha = 1; // Request new position from physics
        }

        // Refresh renderer on a higher (or unlimited) interval
        this.renderDeltaSum += delta;
        if (this.renderDeltaSum > this.renderInterval || this.renderTickRate < 0) {
            this.renderDeltaSum %= this.renderInterval;
            this.updateRender(delta, alpha);
        }
    }

    updatePhysics(interval) {
        this.stats.begin(); // Begin FPS counter
        // TODO: Run ray traces here
    }

    updateRender(delta, alpha) {
        // Set delta to target renderInterval
        if (this.renderTickRate > 0) delta = this.renderInterval;

        // Loop through all child objects
        for (var i = 0; i < this.scene.children.length; i++) {
            var child = this.scene.children[i];

            // Update 3D object to rigid body position
            if (child?.body?.type == 1) {
                child.update(delta, alpha, this.debugger);
            }

            // Update animations
            if (child.animation) {
                child.animation.update(delta);
            }
        }

        // Render new scene
        this.renderer.render(this.scene, this.camera);
        this.stats.end(); // End FPS counter
    }

    resizeWindow(e) {
        var width = window.innerWidth;
        var height = window.innerHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    pause(play = false) {
        this.play = play;
        this.clock.stop();
        this.clock.elapsedTimePaused = this.clock.getElapsedTime();
    }

    resume(play = true) {
        this.play = play;
        this.clock.start();
        this.clock.elapsedTime = this.clock.elapsedTimePaused || 0;
    }

    visibilityChange() {
        if (document.visibilityState == 'visible') this.resume(this.play);
        else this.pause(this.play);
    }
}
window.app = new App();