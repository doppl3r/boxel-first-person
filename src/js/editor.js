import { BoxGeometry, Group, Mesh, MeshLambertMaterial, PerspectiveCamera, Raycaster, Vector3 } from 'three';

class Editor extends Group {
    constructor() {
        super();
        this.raycaster = new Raycaster();
        this.force = new Vector3();
        this.vector = new Vector3();
        this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 100);
        this.camera.up.set(0, 0, 1);
        this.camera.rotation.set(Math.PI / 2, 0, 0);
        this.selector = new Mesh(
            new BoxGeometry(1, 1, 1),
            new MeshLambertMaterial({ color: '#ffffff', opacity: 0.5, transparent: true})
        );
        this.add(this.camera);

        // Set basic physics (similar to CannonJS Body class)
        this.physics = {
            position: new Vector3(),
            previousPosition: new Vector3(),
            velocity: new Vector3()
        }
        this.acceleration = 0.25;
        this.speed = 0.25;
    }

    update(delta, alpha) {
        // Only move if camera is set from the app
        if (this.camera.isActive) {
            // Add controls to position
            if (this.controls) {
                // Interpolate model position
                this.position.lerpVectors(this.physics.previousPosition, this.physics.position, alpha);

                // Update camera rotation
                this.camera.quaternion.copy(this.controls.quaternion);
            }
        }
    }

    updatePhysics(delta, alpha) {
        // Only move if camera is set from the app
        if (this.camera.isActive) {
            // Add controls
            if (this.controls) {
                this.force.set(0, 0, 0)
                if (this.controls.keys['KeyW'] == true) this.force.y = this.acceleration;
                if (this.controls.keys['KeyS'] == true) this.force.y = -this.acceleration;
                if (this.controls.keys['KeyD'] == true) this.force.x = this.acceleration;
                if (this.controls.keys['KeyA'] == true) this.force.x = -this.acceleration;
                if (this.controls.keys['ShiftLeft'] == true) this.force.z = -this.acceleration * 0.25;
                if (this.controls.keys['Space'] == true) this.force.z = this.acceleration * 0.25;

                // Apply directional velocity
                if (this.force.length() != 0) {
                    this.force.applyEuler(this.controls.direction);
                    this.physics.velocity.add(this.force);

                    // Clamp velocity speed
                    if (this.physics.velocity.length() > this.speed) {
                        this.vector.copy(this.physics.velocity);
                        this.vector.clampLength(-this.speed, this.speed);
                        this.physics.velocity.x = this.vector.x;
                        this.physics.velocity.y = this.vector.y;
                    }
                }

                // Apply damping
                this.physics.velocity.multiplyScalar(0.75);

                // Add velocity to position
                this.physics.previousPosition.copy(this.physics.position);
                this.physics.position.add(this.physics.velocity);
            }
        }
    }

    updateSelector() {
        // TODO: Update selector to raycaster contact
        this.raycaster.ray.origin.copy(this.position);
        this.raycaster.ray.direction.copy(this.camera.up).negate().applyQuaternion(this.controls.quaternion);
        var _this = this;

        var contact = this.raycaster.intersectObject(this.scene)[0];
        if (contact) {
            var object = contact.object;
            object.traverseAncestors(function(obj) {
                if (obj.body) {
                    _this.selector.position.copy(obj.position);
                    _this.selector.rotation.copy(obj.rotation);
                    _this.selector.scale.copy(obj.scale).multiplyScalar(1.125);
                    _this.selector.selected = obj;
                }
            });
        }
    }

    addObject() {
        // TODO: Add object to selector
    }

    removeObject() {
        // TODO: Remove object at selector contact
        var object = this.selector.selected;
        if (object) {
            if (object.body) {
                object.parent.remove(object);
            }
        }
    }

    setControls(controls) {
        var _this = this;
        this.controls = controls;
        this.controls.addEventListener('mousedown', function(e) {
            if (_this.camera.isActive) {
                if (e.button == 0) _this.addObject();
                if (e.button == 2) _this.removeObject();
            }
        });
        this.controls.addEventListener('mousemove', function(e) {
            if (_this.camera.isActive) {
                // Update the selector position
                _this.updateSelector();
            }
        })
    }

    setScene(scene) {
        this.scene = scene;
        this.scene.add(this.selector);
    }
}

export { Editor };