class App {
    constructor() {
        this.raycastArray = [];
        this.hud = new HUD(g_scene_container);
        this.clock = new THREE.Clock();
        this.delta = this.clock.getDelta();
        this.playerInstance = {};
        this.app = {};
    }

    initialize() {
        let axisHelper = new THREE.AxisHelper(1);
        axisHelper.position.set(0, 0.1, 0);
        g_scene.add(axisHelper);
    
        this.playerInstance = new Player(this.hud);
    
        g_loadingScreen.complete();
    
        this.animate();
    };

    animate = function () {
        this.delta = this.clock.getDelta();
    
        g_physicsFactory.update(this.delta);
    
        this.playerInstance.update(this.delta);
    
        g_fpsMoverInstance.update();
    
        // used in Weapon.js
        TWEEN.update();
    
        g_stats.update();
    
        if (g_skyCube !== undefined) {
            g_skyCube.update(g_camera, g_renderer);
        }
    
        g_renderer.render(g_scene, g_camera);
    
        requestAnimationFrame(this.animate);
    }.bind(this);
}
