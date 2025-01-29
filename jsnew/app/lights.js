// BASIC_SCENE_SETUP_ITEM

var ambientLight = new THREE.AmbientLight(0x444444);
g_scene.add(ambientLight);


// Spot Top
var dirLight = addShadowedLight(2.1, 8, 3, 0xffffff, 0.6); //0.6

function addShadowedLight(x, y, z, color, intensity) {
    var directionalLight = new THREE.DirectionalLight(color, intensity);
    directionalLight.position.set(x, y, z);
    g_scene.add(directionalLight);

    directionalLight.castShadow = true;

    var d = 6;
    directionalLight.shadow.camera.left = -d;
    directionalLight.shadow.camera.right = d;
    directionalLight.shadow.camera.top = d;
    directionalLight.shadow.camera.bottom = -d;

    directionalLight.shadow.camera.near = directionalLight.position.y - d;
    directionalLight.shadow.camera.far = directionalLight.position.y + d;

    directionalLight.shadow.mapSize.width = directionalLight.shadow.mapSize.height = 2048;

    g_scene.add(directionalLight);

    return directionalLight;
}
