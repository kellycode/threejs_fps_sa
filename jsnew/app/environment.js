// needs to be loaded after physicsFactory.js

var env_textureLoader = new THREE.TextureLoader(g_loadingManager);

// Ground
var texture = env_textureLoader.load("./assets/images/environment_img_b.jpg");
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set(64, 64);
var item_name = "Ground";
var plane = g_physicsFactory.createPlane(1, 50, 50, 0, new THREE.MeshPhongMaterial({ map: texture }), item_name);
plane.visible = true;
plane.name = item_name;
g_scene.add(plane);


// BROWNISH BOX
var box_geometry = new THREE.BoxBufferGeometry(1, 1, 1);
// note that the `BoxGeometry` arguments are the box's full width, height,
// and depth, while the parameters for `Goblin.BoxShape` are expressed as half sizes
var box_material = new THREE.MeshLambertMaterial({ color: 0xaa8833 });
var dynamic_mesh = new THREE.Mesh(box_geometry, box_material);
dynamic_mesh.position.set(0, 1, -6);
dynamic_mesh.name = "Bouncing Box";
g_scene.add(dynamic_mesh);

g_physicsFactory.meshToBody(dynamic_mesh, 50);

