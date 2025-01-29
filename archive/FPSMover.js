/**
 * FPS Mover Class
 * Creates a Character Controller
 * that is controlled by PointerLockAmmoControls
 *
 */

// ALMOST_A_CLASS

function FPSMover(camera, domElement) {
    var pointerLockControls = new PointerLockControls(camera, domElement);
    var radius = 0.4;
    var height = 1.8;
    var eyeheight = 1.6;
    var visualizePlayer = false;
    //var physicFactory = physics;

    this.getControls = function () {
        return pointerLockControls;
    };

    this.reset = function () {
        pointerLockControls.resetRotation();
        this.body.position.set(0, height / 2 + 0.5, 2);
    };

    this.movementSpeed = 4; //4
    this.jumpImpulse = 100;
    this.sprintSpeedMultiplier = 4;

    //basically its a THREE.Object3D with the camera as children
    var controlsObj = pointerLockControls.getObject();
    var keyboard = pointerLockControls;
    var physicWorld = Global_Store.physicsFactory.getWorld();

    this.isGrounded = false;

    var currentGroundHeight = 0;
    var meshForward = new THREE.Vector3();
    var goblinUpVector = new Goblin.Vector3(0, 1, 0);
    var velV = new Goblin.Vector3(0, 0, 0);
    var goblinMeshForward = new Goblin.Vector3(0, 0, 0);
    var goblinMeshRight = new Goblin.Vector3(0, 0, 0);
    var goblinZeroVector = new Goblin.Vector3(0, 0, 0);

    this.getVelocity = function () {
        return velV;
    };

    function createCapsuleGeometry(radius, height) {
        var cylinderHeight = height - radius * 2;
        var cylinder = new THREE.CylinderGeometry(radius, radius, cylinderHeight, 20, 10, true);
        var cap = new THREE.SphereGeometry(radius, 10, 10, 0, Math.PI * 2, 0, Math.PI);

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

    function createCharacterTestCapsule(radius, height) {
        var character = new THREE.Mesh(
            createCapsuleGeometry(radius, height),
            new THREE.MeshLambertMaterial({
                color: 0x00ff00,
                transparent: true,
                opacity: 0.2,
                // side: THREE.DoubleSide
            })
        );

        // helps indicate which direction is forward
        var directionMesh = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 0.2, 1, 1, 1, 1),
            new THREE.MeshLambertMaterial({ color: 0x0000ff, transparent: true, opacity: 0.25 })
        );
        character.castShadow = directionMesh.castShadow = true;

        directionMesh.position.set(0, 0, -radius * 2);

        return character;
    }

    this.mesh = createCharacterTestCapsule(radius, height);
    this.mesh.material.visible = visualizePlayer;

    scene.add(this.mesh);

    // SET PLAYER POSITION & ROTATION
    // slightly off the ground
    this.mesh.position.set(0, height / 2 + 0.5, 2);

    this.mesh.add(controlsObj);
    controlsObj.position.set(0, eyeheight - height / 2, 0);

    var mass = 50;

    var body = new Goblin.RigidBody(new Goblin.CylinderShape(radius, height / 2), mass);

    var GROUP_PLAYER = 2;
    body.collision_groups = GROUP_PLAYER;

    var position = this.mesh.getWorldPosition();
    body.position.copy(position);

    var rotation = this.mesh.quaternion;
    body.rotation = new Goblin.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w);

    body.friction = 1;
    body.restitution = 0;
    body.linear_damping = 0.5;
    // body.angular_damping = 1; // no effect when angular factor is zero?
    // turns off all rotation
    body.angular_factor = new Goblin.Vector3(0, 0, 0); // disable rotations on the body

    Global_Store.physicsFactory.addBody(body, this.mesh);
    physicWorld.addRigidBody(body);

    this.body = body;

    // keeps physics from going to sleep (from bullet documentation)
    // var DISABLE_DEACTIVATION = 4;
    // this.body.setActivationState(DISABLE_DEACTIVATION);

    var o = {
        factor: 0.28,
    };

    // ---------------------------------------------------------------------------
    // check if the player mesh is touching the ground
    var updateGrounding = (function () {
        // this part will be exectued once
        var fromPoint = new Goblin.Vector3();
        var toPoint = new Goblin.Vector3();
        var rayPadding = height * 0.05 + o.factor; //extra padding because of clamping

        var BasicBroadphase = Global_Store.physicsFactory.getEngine();

        return function () {
            // position
            fromPoint.set(
                this.mesh.matrixWorld.elements[12],
                this.mesh.matrixWorld.elements[13],
                this.mesh.matrixWorld.elements[14]
            );

            toPoint.set(fromPoint.x, fromPoint.y - height / 2 - rayPadding, fromPoint.z);

            // console.log( fromPoint, toPoint );
            // this.isGrounded = true;
            // var intersections = [];
            // this.body.rayIntersect ( fromPoint, toPoint, intersections );

            var intersections = BasicBroadphase.rayIntersect(fromPoint, toPoint);

            if (intersections[1] !== undefined) {
                this.isGrounded = true;
            } else {
                this.isGrounded = false;
            }
        };
    })();

    // ---------------------------------------------------------------------------

    this.update = function () {
        // TODO:
        // make character a little bit controllable in the air

        updateGrounding.call(this);

        // reset pos if glitch
        var outOfBounds = this.body.position.y < -2 || this.body.position.y > 10;
        if (outOfBounds) {
            console.warn("reset", this.body.position);
        }

        // rotate the body in view direction
        // (mainly doing this for correct audio listener orientation)
        var yRotation = pointerLockControls.getYRotation();
        var euler = new THREE.Euler(0, yRotation, 0, "XYZ");
        var quat = new THREE.Quaternion().setFromEuler(euler);

        this.body.rotation = new Goblin.Quaternion(quat.x, quat.y, quat.z, quat.w);

        if (this.isGrounded) {
            if (!keyboard.spacebar) {

                // get camera direction
                meshForward = camera.getWorldDirection();

                // convert to Goblin vector, project to plane
                goblinMeshForward.set(meshForward.x, 0, meshForward.z);
                goblinMeshForward.normalize();

                // right direction is dir X yUnit
                goblinMeshRight.crossVectors(goblinMeshForward, goblinUpVector);

                // set up physics for next time
                velV.set(0, 0, 0);

                if (keyboard.forward) velV.add(goblinMeshForward);
                if (keyboard.right) velV.add(goblinMeshRight);
                if (keyboard.left) velV.subtract(goblinMeshRight);
                if (keyboard.back) velV.subtract(goblinMeshForward);

                // Only apply movement if we have a significant distance to cover
                // length2 == lengthSquared ?

                if (velV.lengthSquared() > 0.001) {
                    velV.normalize();
                    velV.scale(this.movementSpeed);

                    if (keyboard.shift) {
                        velV.scale(this.sprintSpeedMultiplier); //custom
                    }

                    // chandlerp advice
                    // idk but i can walk stairs now
                    this.body.linear_factor.set(1, 1, 1);
                    this.body.linear_velocity = velV;
                } else {
                    // console.log("nix");
                    // chandlerp advice
                    this.body.linear_factor.set(0, 1, 0);
                    this.body.linear_velocity = goblinZeroVector;
                }
                // console.log( velV );
            } else {
                // Help the character get above the terrain and then apply up force
                // this.body.translate( new Ammo.btVector3( 0, height * 0.15, 0 ) );
                this.body.position.y += 0.1;
                this.body.applyImpulse(new Goblin.Vector3(0, this.jumpImpulse / 12, 0));
            }
        }

        keyboard.spacebar = false;
    };
}
