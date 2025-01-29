// // BASIC_SCENE_SETUP_ITEM

var g_camera;

// CAMERA
var screen_width = window.innerWidth;
var screen_height = window.innerHeight;
var aspect = screen_width / screen_height;
var view_angle = 60;
var near = 0.1;
var far = 100;

g_camera = new THREE.PerspectiveCamera(view_angle, aspect, near, far);

var resizeCallback = function () {
    var width = window.innerWidth;
    var height = window.innerHeight;

    // notify the renderer of the size change
    g_renderer.setSize(width, height);
    // update the camera
    g_camera.aspect = width / height;
    g_camera.updateProjectionMatrix();
};

window.addEventListener("resize", resizeCallback, false);
