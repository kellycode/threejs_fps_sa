// ALMOST_A_CLASS

// var broadphase = new Goblin.BasicBroadphase();
var broadphase = new Goblin.SAPBroadphase();
Goblin.GjkEpa.margins = 0.05;

var v_save = 0;

function PhysicFactory() {
    this.world = new Goblin.World(broadphase, new Goblin.NarrowPhase(), new Goblin.IterativeSolver());
    Global_Store.world = this.world;
    this.body_to_mesh_map = {};
}

PhysicFactory.prototype.getWorld = function () {
    return this.world;
};

PhysicFactory.prototype.getEngine = function () {
    return broadphase;
};

PhysicFactory.prototype.addBody = function (rigidBody, mesh) {
    this.body_to_mesh_map[rigidBody.id] = mesh;
};

var endPoint = new Goblin.Vector3();
PhysicFactory.prototype.raycast = function (startPoint, direction) {
    // todo
    // dont intersect with Ghost Bodys!
    // dont intersect with player cylinder

    var distance = 40;
    endPoint.addVectors(startPoint, direction.multiplyScalar(distance));
    // console.log( startPoint, endPoint );

    var intersections = this.getWorld().rayIntersect(startPoint, endPoint);

    return intersections;
};

// http://stackoverflow.com/questions/11409895/whats-the-most-elegant-way-to-cap-a-number-to-a-segment
/**
 * Returns a number whose value is limited to the given range.
 *
 * Example: limit the output of this computation to between 0 and 255
 * (x * 255).clamp(0, 255)
 *
 * @param {Number} min The lower boundary of the output range
 * @param {Number} max The upper boundary of the output range
 * @returns A number in the range [min, max]
 * @type Number
 */
Number.prototype.clamp = function (min, max) {
    return Math.min(Math.max(this, min), max);
};

function calculateHitForce(distance, power) {
    // fixed power (boring)
    // invertNormalGoblin.scale( power );

    // 1 / 10 = 0.1
    // ( 100 power * 5 ) * 0.1 = 50
    // ( 50 power * 5 ) * 0.1 = 25
    // 10m distanz = 50 power
    // 20m distanz = 25 power

    var impactForce = (power * 5 * (1 / distance)).clamp(20, power);
    console.log(20 + ' ; ' + power + ' ; ' + impactForce)

    // console.log( "distance", distance );
    // console.log( impactForce );

    return impactForce;
}

var invertNormalGoblin = new Goblin.Vector3();
PhysicFactory.prototype.applyDirectionalImpulse = function (target, fromVector, power) {
    // console.log( target );

    // var normal = target.normal;
    var body = target.object;
    var point = target.point;

    // danger
    // math operation using THREE.Vector3
    // no obvious errors
    invertNormalGoblin.subtractVectors(point, fromVector);

    var distance = invertNormalGoblin.length();
    var impactForce = calculateHitForce(distance, power);

    invertNormalGoblin.normalize();
    invertNormalGoblin.scale(impactForce);

    body.applyForceAtWorldPoint(invertNormalGoblin, point);
};

PhysicFactory.prototype.ghostBody = function (dimension, position, rotation) {
    var goblinDimension = dimension.clone().divideScalar(2);
    var rotation = rotation || new THREE.Vector3(0, 0, 0);

    // box physics
    var shape_ghost = new Goblin.BoxShape(goblinDimension.x, goblinDimension.y, goblinDimension.z);
    var position = new THREE.Vector3(position.x, position.y + goblinDimension.y, position.z);

    var ghost_body = new Goblin.GhostBody(shape_ghost);
    ghost_body.position.copy(position);

    ghost_body.rotation = new Goblin.Quaternion(rotation.x, rotation.y, rotation.z, 1);

    this.getWorld().addGhostBody(ghost_body);

    return ghost_body;
};

PhysicFactory.prototype.makeStaticBox = function (
    dimension,
    position,
    rotation,
    mergeGeometry,
    materialIndex,
    shape,
    transform
) {
    var goblinDimension = dimension.clone().divideScalar(2);

    var rotation = rotation || new THREE.Vector3(0, 0, 0);

    var materialIndex = materialIndex || 0;
    // box physics
    var shape = shape || new Goblin.BoxShape(goblinDimension.x, goblinDimension.y, goblinDimension.z);

    var position = new THREE.Vector3(position.x, position.y + goblinDimension.y, position.z);

    var dynamic_body = new Goblin.RigidBody(shape, 0.0);

    dynamic_body.position.copy(position);

    dynamic_body.rotation = new Goblin.Quaternion(rotation.x, rotation.y, rotation.z, 1);

    this.world.addRigidBody(dynamic_body);

    if (typeof mergeGeometry === "undefined") {
        return box;
    } else {
        var box = new THREE.Mesh(new THREE.BoxGeometry(dimension.x, dimension.y, dimension.z));
        box.position.set(position.x, position.y, position.z);
        box.rotation.copy(rotation);
        box.updateMatrix();
        for (var i = 0; i < box.geometry.faces.length; i++) {
            box.geometry.faces[i].materialIndex = 0;
        }

        mergeGeometry.merge(box.geometry, box.matrix, materialIndex);
    }
};

PhysicFactory.prototype.getProxyMesh = function (object, geometryType) {
    // CALCULATE BOUNDING BOX BEFORE ROTATION!
    var helper = new THREE.BoundingBoxHelper(object, 0xff0000);
    helper.update();

    var boundingBoxSize = helper.box.max.sub(helper.box.min);

    var geometry;
    if (geometryType === "Cylinder") {
        geometry = new THREE.CylinderGeometry(
            Math.max(boundingBoxSize.x, boundingBoxSize.z) / 2,
            Math.max(boundingBoxSize.x, boundingBoxSize.z) / 2,
            boundingBoxSize.y
        );
    } else {
        geometry = new THREE.BoxGeometry(boundingBoxSize.x, boundingBoxSize.y, boundingBoxSize.z);
    }

    var material = new THREE.MeshBasicMaterial({ visible: true, wireframe: true });
    var mesh = new THREE.Mesh(geometry, material);

    object.geometry.translate(0, -boundingBoxSize.y / 2, 0);
    mesh.add(object);

    return mesh;
};

PhysicFactory.prototype.meshToBody = function (mesh, mass) {
    var type = mesh.geometry.type;
    // console.log( type );

    if (type === "BoxGeometry" || type === "BoxBufferGeometry") {
        if (mesh.geometry.parameters !== undefined) {
            var width = mesh.geometry.parameters.width;
            var height = mesh.geometry.parameters.height;
            var depth = mesh.geometry.parameters.depth;
        }
        // dimensions are half width, half height, and half depth, or a box 1x1x1
        var shape = new Goblin.BoxShape(width / 2, height / 2, depth / 2); 
    } else if (type === "SphereGeometry" || type === "SphereBufferGeometry") {
        var shape = new Goblin.SphereShape(mesh.geometry.boundingSphere.radius);
    } else if (type === "CylinderGeometry") {
        if (mesh.geometry.parameters !== undefined) {
            var radiusTop = mesh.geometry.parameters.radiusTop;
            var radiusBottom = mesh.geometry.parameters.radiusBottom;
            var height = mesh.geometry.parameters.height;
        }

        var shape = new Goblin.CylinderShape(radiusBottom, height / 2);
    }


    var dynamic_body = new Goblin.RigidBody(shape, mass);
    var position = mesh.getWorldPosition();
    dynamic_body.position.copy(position);

    var rotation = mesh.quaternion;
    dynamic_body.rotation = new Goblin.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w);

    this.world.addRigidBody(dynamic_body);

    this.addBody(dynamic_body, mesh);

    dynamic_body.name = mesh.name;

    return dynamic_body;
};

PhysicFactory.prototype.createPlane = function (orientation, half_width, half_length, mass, material, name) {
    var thickness = 0.4;

    var plane = new THREE.Mesh(
        new THREE.BoxGeometry(
            orientation === 1 || orientation === 2 ? half_width * 2 : thickness,
            orientation === 0 ? half_width * 2 : orientation === 2 ? half_length * 2 : thickness,
            orientation === 0 || orientation === 1 ? half_length * 2 : thickness
        ),
        material
    );
    // plane.castShadow = true;
    plane.position.set(0, -thickness / 2, 0);
    plane.matrixAutoUpdate = false;
    plane.updateMatrix();
    plane.receiveShadow = true;
    plane.goblin = new Goblin.RigidBody(
        new Goblin.BoxShape(
            orientation === 1 || orientation === 2 ? half_width : thickness / 2,
            orientation === 0 ? half_width : orientation === 2 ? half_length : thickness / 2,
            orientation === 0 || orientation === 1 ? half_length : thickness / 2
        ),
        mass
    );

    plane.goblin.position.set(0, -thickness / 2, 0);

    this.world.addRigidBody(plane.goblin);

    plane.goblin.name = name;
    plane.name = name;

    return plane;
};

PhysicFactory.prototype.update = function () {
    // run physics simulation
    this.world.step(1 / 60, 1 / 60);

    // update mesh positions / rotations
    for (var i = 0; i < this.world.rigid_bodies.length; i++) {
        var body = this.world.rigid_bodies[i];
        if (this.body_to_mesh_map[body.id] === undefined) {
            continue;
        }
        var mesh = this.body_to_mesh_map[body.id];

        // update position

        // workaround for goblin sending huge
        // body.position values on collison
        const maxDifference = 0.1;

        let new_x = mesh.position.x - body.position.x
        let new_y = mesh.position.y - body.position.y
        let new_z = mesh.position.z - body.position.z

        if(new_x > 1) {
            console.log('new_x', new_x)
        }

        //console.log(new_x)w

        // Check the difference for the x position
        if (Math.abs(new_x) <= maxDifference) {
            mesh.position.x = body.position.x;
        } else {
            console.log('x', Math.abs(new_x))
        }

        // Check the difference for the y position
        // + 2 allows jumping
        if (Math.abs(new_y) <= maxDifference + 2) {
            mesh.position.y = body.position.y;
        } else {
            console.log('y', Math.abs(new_y))
        }

        // Check the difference for the z position
        if (Math.abs(new_z) <= maxDifference) {
            mesh.position.z = body.position.z;
        } else {
            console.log('z', Math.abs(new_z))
        }

        // update rotation
        mesh.quaternion._x = body.rotation.x;
        mesh.quaternion._y = body.rotation.y;
        mesh.quaternion._z = body.rotation.z;
        mesh.quaternion._w = body.rotation.w;
    }
};
