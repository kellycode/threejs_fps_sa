// BASIC_SCENE_SETUP_ITEM

var g_listener = new THREE.AudioListener();

g_listener.setMasterVolume(0.5);

// breaks collisions
//camera.add(listener);

g_scene.add(g_listener)

var SoundControls = {
    master: g_listener.getMasterVolume(),
};


