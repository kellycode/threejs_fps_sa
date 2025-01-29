/**
 * Init Weapons
 *
 */

"use strict";

function onProgress(xhr) {
    // console.log("on progress", xhr );
}

function onError(xhr) {
    console.error("error", xhr);
}

function gunHelper(mesh, offset) {
    var test = mesh.clone();
    scene.add(test);
    test.position.set(0, 1.2, 0);

    var x = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), new THREE.MeshNormalMaterial({ wireframe: true }));
    test.add(x);
    x.position.copy(offset);
}

function screenPosition(percentX, percentY, posz) {
    var position = new THREE.Vector3();

    var pyramidPositionX = (percentX / 100) * 2 - 1;
    var pyramidPositionY = (percentY / 100) * 2 - 1;

    position.set(pyramidPositionX * camera.aspect, pyramidPositionY, posz);

    return position;
}

var loadedWeapons = {};

// MODELS AND TEXTURES

//1912
// scale 0.11, y+z* 0.15

var textureLoader = new THREE.TextureLoader(loadingManager);
var loader = new THREE.OBJLoader(loadingManager);

var t_shotgun = textureLoader.load("assets/models/ithaca/M37_diffuse.jpg");
var t_shotgun_n = textureLoader.load("assets/models/ithaca/M37_normal.jpg");
var t_shells = textureLoader.load("assets/models/ithaca/Shells_diffuse.jpg");
var t_shells_n = textureLoader.load("assets/models/ithaca/Shells_normal.jpg");
var t_shotgun_s = textureLoader.load("assets/models/ithaca/M37_specular.jpg");

//var tt_shotgun = Global_Store.preloaded.textures["assets/models/ithaca/M37_diffuse.jpg"];

var shotgunMesh;

loader.load(
    "assets/models/ithaca/m37_tris.obj",
    function (object) {
        var s = 0.003;
        for (var i = 0; i < object.children.length; i++) {
            var obj = object.children[i];
            obj.geometry.scale(s, s, s);
            obj.geometry.applyMatrix(new THREE.Matrix4().makeRotationY((180 * Math.PI) / 180));
        }

        var bbox = new THREE.BoundingBoxHelper(object);
        bbox.update();
        var boundingBoxSize = bbox.box.max.sub(bbox.box.min);

        var offset = new THREE.Vector3(-0.02, 0, -(boundingBoxSize.z / 2 + 0.05));
        object.userData.emitterVector = offset;

        object.receiveShadow = true;
        var material = object.children[0].material;
        material.color.setHSL(0, 0, 2);
        material.map = t_shotgun;
        material.normalMap = t_shotgun_n;
        material.specularMap = t_shotgun_s;
        material.specular.setHex(0xffffff);
        material.map.anisotropy = 8; //front barrel of the weapon gets blurry

        var material2 = object.children[2].material.clone();
        material2.map = t_shells;
        material2.normalMap = t_shells_n;
        object.children[2].material = material2;

        var position = screenPosition(54, 42, -0.5);
        object.position.copy(position);

        loadedWeapons.shotgun = object;
    },
    onProgress,
    onError
);


var t_sniper = textureLoader.load("assets/models/mk14/MK14.jpg");
var t_sniper_n = textureLoader.load("assets/models/mk14/MK14_normalprot.jpg");
var t_sniper_s = textureLoader.load("assets/models/mk14/MK14_specular.jpg");
var sniperMesh;

loader.load(
    "assets/models/mk14/MK14_2.obj",
    function (object) {
        var object = object.children[0];

        var s = 0.003;
        object.geometry.center();
        object.geometry.scale(s, s, s);

        var bbox = new THREE.BoundingBoxHelper(object);
        bbox.update();
        var boundingBoxSize = bbox.box.max.sub(bbox.box.min);

        var offset = new THREE.Vector3(0, boundingBoxSize.y / 3.5, -(boundingBoxSize.z / 2 + 0.05));
        object.userData.emitterVector = offset;

        var material = object.material;
        material.map = t_sniper;
        material.normalMap = t_sniper_n;
        material.normalScale.set(-1, -1);
        material.specularMap = t_sniper_s;
        material.specular.setHex(0x444444);
        material.shininess = 30;

        object.rotation.x = (-3 * Math.PI) / 180; // - positiv = weiter nach unten

        var position = screenPosition(53, 39, -0.5);
        object.position.copy(position);

        loadedWeapons.sniper = object;
    },
    onProgress,
    onError
);

var t_rifle = textureLoader.load("assets/models/g36c/mat/g36c_d_fin.jpg");
var t_rifle_n = textureLoader.load("assets/models/g36c/mat/g36c_n_fin.jpg");
var t_rifle_s = textureLoader.load("assets/models/g36c/mat/g36c_spec.jpg");
var t_rifle_ao = textureLoader.load("assets/models/g36c/mat/basic/g36c_bake_ao.png");
var t_rifle_l = textureLoader.load("assets/models/g36c/mat/basic/g36c_bake_general_light_fine.png");
var rifleMesh;
loader.load(
    "assets/models/g36c/g36c_arby26.obj",
    function (object) {
        var object = object.children[0];

        var s = 0.05;
        object.geometry.center();
        object.geometry.scale(s, s, s);

        var bbox = new THREE.BoundingBoxHelper(object);
        bbox.update();
        var boundingBoxSize = bbox.box.max.sub(bbox.box.min);

        var offset = new THREE.Vector3(0, boundingBoxSize.y / 5, -(boundingBoxSize.z / 2 + 0.05));
        object.userData.emitterVector = offset;

        var material = object.material;
        material.map = t_rifle;
        material.normalMap = t_rifle_n;
        material.normalScale.set(-1, -1);
        material.specularMap = t_rifle_s;
        material.aoMap = t_rifle_ao;

        object.rotation.x = (-3 * Math.PI) / 180;

        var position = screenPosition(54, 31, -0.5);
        object.position.copy(position);

        loadedWeapons.rifle = object;
    },
    onProgress,
    onError
);
