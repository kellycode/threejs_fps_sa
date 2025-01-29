/**
 * Setup the control method
 */

// CONTROLS

g_fpsMoverInstance = new FPSMover(g_camera, g_scene_container);

g_crosshair = new Crosshair(0.003, 0.002, g_camera);

g_crosshair.material.transparent = true;

g_fpsMoverInstance.crosshair = g_crosshair;

function thirdPerson(value) {
    if (value) {
        g_camera.position.set(0, 1.5, 4);
        g_fpsMoverInstance.mesh.material.visible = value;
        g_crosshair.visible = false;
    } else {
        g_camera.position.set(0, 0, 0);
        g_fpsMoverInstance.mesh.material.visible = value;
        g_crosshair.visible = true;
    }
}

var options = {
    thirdPerson: false,
    reset: function () {
        tweenHelper.resetCamera(600);
    },
};

document.addEventListener("keydown", onDocumentKeyDown, false);

var toggle = true;

function onDocumentKeyDown(event) {
    event = event || window.event;
    var keycode = event.keyCode;

    switch (keycode) {
        case 81: //Q
            thirdPerson(toggle);
            toggle = !toggle;
            break;
    }
}
