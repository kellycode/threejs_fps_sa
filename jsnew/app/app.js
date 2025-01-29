g_raycastArray = [];
g_hud = new HUD(g_scene_container);
g_clock = new THREE.Clock();
g_delta = g_clock.getDelta();
g_playerInstance = {};
g_app = {};

// Start program
g_app.initialize = function () {
    let axisHelper = new THREE.AxisHelper(1);
    axisHelper.position.set(0, 0.1, 0);

    g_scene.add(axisHelper);

    g_playerInstance = new Player(g_hud);

    g_loadingScreen.complete();

    animate();
};

// MAIN LOOP
var animate = function () {
    g_delta = g_clock.getDelta();

    g_physicsFactory.update(g_delta);
    
    g_playerInstance.update(g_raycastArray);

    g_fpsMoverInstance.update();

    // used in Weapon.js
    TWEEN.update();

    g_stats.update();

    if(g_skyCube !== undefined) {
        g_skyCube.update(g_camera, g_renderer);

    }
    
    g_renderer.render(g_scene, g_camera);

    requestAnimationFrame(animate);
};
