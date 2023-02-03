import { Clock, PCFSoftShadowMap, PerspectiveCamera, WebGLRenderer } from 'three';
import { Controls } from './controls';
import { Dungeon } from './dungeon';
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
        this.controls = new Controls();
        this.scene = new Dungeon();
        this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 100);
        this.renderer = new WebGLRenderer({ antialias: true, alpha: false });
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = PCFSoftShadowMap;

        // Append renderer to canvas
        document.body.appendChild(this.renderer.domElement);
        document.body.appendChild(this.stats.dom);
        
        // Add event listeners
        document.addEventListener('visibilitychange', function(e) { _this.visibilityChange(); });
        document.addEventListener('click', function () { _this.controls.lock(); });
        window.addEventListener('resize', function(e) { _this.resizeWindow(e); });

        // Resize window
        this.resizeWindow();

        // Initialize app after loading assets
        this.assets.load(function() {
            _this.init();
            _this.renderer.setAnimationLoop(function() { _this.loop(); });
        });
    }

    init() {
        this.scene.init(this);
    }

    loop() {
        // Update time factors
        var delta = this.clock.getDelta() * this.clock.scale;
        var alpha = this.physicsDeltaSum / this.physicsInterval; // Interpolation factor

        // Refresh renderer on a higher interval
        this.renderDeltaSum += delta;
        if (this.renderDeltaSum > this.renderInterval) {
            this.renderDeltaSum %= this.renderInterval;
            this.updateRender(delta, alpha);
        }
        
        // Update engine on a lessor interval
        this.physicsDeltaSum += delta;
        if (this.physicsDeltaSum > this.physicsInterval) {
            alpha = (this.physicsDeltaSum - delta) / this.physicsInterval; // Request new position from physics
            this.physicsDeltaSum %= this.physicsInterval; // reset with remainder
            this.updatePhysics(this.physicsInterval, alpha);
        }
    }
    
    updateRender(delta, alpha) {
        // Set delta to target renderInterval
        if (this.renderTickRate > 0) delta = this.renderInterval;

        // Update controls
        this.controls.update(delta, alpha);

        // Loop through all child objects
        this.scene.updateRender(delta, alpha);

        // Render new scene
        this.renderer.render(this.scene, this.camera);
        this.stats.end(); // End FPS counter
    }

    updatePhysics(delta, alpha) {
        this.stats.begin(); // Begin FPS counter
        this.scene.updatePhysics(delta, alpha);
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

// Expose app to window for debugging
window.app = new App();