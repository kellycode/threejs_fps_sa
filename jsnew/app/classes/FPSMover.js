/**
 * FPS Mover Class
 * Creates a Character Controller
 * that is controlled by PointerLockAmmoControls
 *
 */

class FPSMover {
    constructor(camera, domElement) {
        this.camera = camera;
        this.domElement = domElement;

        this.pointerLockControls = new PointerLock(camera, domElement);
        this.radius = 0.4;
        this.height = 1.8;
        this.eyeheight = 1.6;
        this.visualizePlayer = false;
        //this.physicFactory = physics;

        this.getControls = function () {
            return this.pointerLockControls;
        };

        this.movementSpeed = 4; //4
        this.jumpImpulse = 100;
        this.sprintSpeedMultiplier = 4;

        //basically its a THREE.Object3D with the camera as children
        this.controlsObj = this.pointerLockControls.getObject();
        this.keyboard = this.pointerLockControls;
        this.physicWorld = g_physicsFactory.getWorld();

        this.isGrounded = false;

        this.currentGroundHeight = 0;
        this.meshForward = new THREE.Vector3();
        this.goblinUpVector = new Goblin.Vector3(0, 1, 0);
        this.velV = new Goblin.Vector3(0, 0, 0);
        this.goblinMeshForward = new Goblin.Vector3(0, 0, 0);
        this.goblinMeshRight = new Goblin.Vector3(0, 0, 0);
        this.goblinZeroVector = new Goblin.Vector3(0, 0, 0);

        this.mesh = this.createCharacterTestCapsule(this.radius, this.height);
        this.mesh.material.visible = this.visualizePlayer;

        // USING GLOBAL
        g_scene.add(this.mesh);

        // SET PLAYER POSITION & ROTATION
        // slightly off the ground
        this.mesh.position.set(0, this.height / 2 + 0.5, 2);

        this.mesh.add(this.controlsObj);
        this.controlsObj.position.set(0, this.eyeheight - this.height / 2, 0);

        this.mass = 50;

        this.body = new Goblin.RigidBody(new Goblin.CylinderShape(this.radius, this.height / 2), this.mass);

        this.GROUP_PLAYER = 2;
        this.body.collision_groups = this.GROUP_PLAYER;

        this.position = this.mesh.getWorldPosition();
        this.body.position.copy(this.position);

        this.rotation = this.mesh.quaternion;
        this.body.rotation = new Goblin.Quaternion(this.rotation.x, this.rotation.y, this.rotation.z, this.rotation.w);

        this.body.friction = 1;
        this.body.restitution = 0;
        this.body.linear_damping = 0.5;
        // body.angular_damping = 1; // no effect when angular factor is zero?
        // turns off all rotation
        this.body.angular_factor = new Goblin.Vector3(0, 0, 0); // disable rotations on the body

        g_physicsFactory.addBody(this.body, this.mesh);
        this.physicWorld.addRigidBody(this.body);

        // keeps physics from going to sleep (from bullet documentation)
        // this.DISABLE_DEACTIVATION = 4;
        // this.body.setActivationState(DISABLE_DEACTIVATION);

        this.o = {
            factor: 0.28,
        };

        // ---------------------------------------------------------------------------
        // check if the player mesh is touching the ground
        this.updateGrounding();

        // ---------------------------------------------------------------------------

        this.seeGroundingPoints = false;
        // just make the dots once
        this.needDot = true;
        this.needDot2 = true;
    }

    getVelocity() {
        return this.velV;
    }

    reset() {
        this.pointerLockControls.resetRotation();
        this.body.position.set(0, this.height / 2 + 0.5, 2);
    }

    makeDot(vect) {
        const point = new THREE.Vector3(vect.x, vect.y, vect.z);
        const sphereGeometry = new THREE.SphereGeometry(0.1, 10, 10);
        const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.position.copy(point);
        g_scene.add(sphere);
    }

    updateGrounding() {
        // this part will be exectued once
        let fromPoint = new Goblin.Vector3();
        let toPoint = new Goblin.Vector3();
        let rayPadding = this.height * 0.05 + this.o.factor; //extra padding because of clamping

        let BasicBroadphase = g_physicsFactory.getEngine();

        // position
        fromPoint.set(
            // TODO: Fix hard coded point to just get lowest point
            // this point is where player head roughly is
            this.mesh.matrixWorld.elements[12],
            this.mesh.matrixWorld.elements[13],
            this.mesh.matrixWorld.elements[14]
        );

        toPoint.set(fromPoint.x, fromPoint.y - this.height / 2 - rayPadding, fromPoint.z);

        // to visualize how updateGrounding works
        if (this.seeGroundingPoints) {
            if (this.needDot && this.needDot2) {
                this.makeDot(fromPoint);
                this.makeDot(toPoint);
                this.needDot = this.needDot2 = false;
            }
        }

        // console.log( fromPoint, toPoint );s
        // this.isGrounded = true;
        // let intersections = [];
        // this.body.rayIntersect ( fromPoint, toPoint, intersections );

        let intersections = BasicBroadphase.rayIntersect(fromPoint, toPoint);

        if (intersections[0] !== undefined) {
            this.isGrounded = true;
        } else {
            this.isGrounded = false;
        }
    }

    createCharacterTestCapsule(radius, height) {
        let character = new THREE.Mesh(
            this.createCapsuleGeometry(radius, height),
            new THREE.MeshLambertMaterial({
                color: 0x00ff00,
                transparent: true,
                opacity: 0.2,
                // side: THREE.DoubleSide
            })
        );

        // helps indicate which direction is forward
        let directionMesh = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 0.2, 1, 1, 1, 1),
            new THREE.MeshLambertMaterial({ color: 0x0000ff, transparent: true, opacity: 0.25 })
        );
        character.castShadow = directionMesh.castShadow = true;

        directionMesh.position.set(0, 0, -radius * 2);

        return character;
    }

    update() {
        // TODO:
        // make character a little bit controllable in the air

        this.updateGrounding();

        // reset pos if glitch
        let outOfBounds = this.body.position.y < -2 || this.body.position.y > 10;
        if (outOfBounds) {
            console.warn("reset", this.body.position);
        }

        // rotate the body in view direction
        // (mainly doing this for correct audio listener orientation)
        let yRotation = this.pointerLockControls.getYRotation();
        let euler = new THREE.Euler(0, yRotation, 0, "XYZ");
        let quat = new THREE.Quaternion().setFromEuler(euler);

        this.body.rotation = new Goblin.Quaternion(quat.x, quat.y, quat.z, quat.w);

        if (this.isGrounded) {
            if (!this.keyboard.spacebar) {
                // get camera direction
                this.meshForward = this.camera.getWorldDirection();

                // convert to Goblin vector, project to plane
                this.goblinMeshForward.set(this.meshForward.x, 0, this.meshForward.z);
                this.goblinMeshForward.normalize();

                // right direction is dir X yUnit
                this.goblinMeshRight.crossVectors(this.goblinMeshForward, this.goblinUpVector);

                // set up physics for next time
                this.velV.set(0, 0, 0);

                if (this.keyboard.forward) this.velV.add(this.goblinMeshForward);
                if (this.keyboard.right) this.velV.add(this.goblinMeshRight);
                if (this.keyboard.left) this.velV.subtract(this.goblinMeshRight);
                if (this.keyboard.back) this.velV.subtract(this.goblinMeshForward);

                // Only apply movement if we have a significant distance to cover
                // length2 == lengthSquared ?

                if (this.velV.lengthSquared() > 0.001) {
                    this.velV.normalize();
                    this.velV.scale(this.movementSpeed);

                    if (this.keyboard.shift) {
                        this.velV.scale(this.sprintSpeedMultiplier); //custom
                    }

                    // chandlerp advice
                    // idk but i can walk stairs now
                    this.body.linear_factor.set(1, 1, 1);
                    this.body.linear_velocity = this.velV;
                } else {
                    // console.log("nix");
                    // chandlerp advice
                    this.body.linear_factor.set(0, 1, 0);
                    this.body.linear_velocity = this.goblinZeroVector;
                }
                // console.log( velV );
            } else {
                // Help the character get above the terrain and then apply up force
                // this.body.translate( new Ammo.btVector3( 0, height * 0.15, 0 ) );
                this.body.position.y += 0.1;
                this.body.applyImpulse(new Goblin.Vector3(0, this.jumpImpulse / 12, 0));
            }
        }

        this.keyboard.spacebar = false;
    }

    createCapsuleGeometry(radius, height) {
        let cylinderHeight = height - radius * 2;
        let cylinder = new THREE.CylinderGeometry(radius, radius, cylinderHeight, 20, 10, true);
        let cap = new THREE.SphereGeometry(radius, 10, 10, 0, Math.PI * 2, 0, Math.PI);

        cylinder.merge(cap, new THREE.Matrix4().makeTranslation(0, -cylinderHeight / 2, 0));
        cylinder.merge(
            cap,
            new THREE.Matrix4().compose(
                new THREE.Vector3(0, cylinderHeight / 2, 0),
                new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI, 0, 0)),
                new THREE.Vector3(1, 1, 1)
            )
        );

        return cylinder;
    }
}
