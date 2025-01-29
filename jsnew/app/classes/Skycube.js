class SkyCube {
    constructor() {
        this.skyTextureLoader = new THREE.CubeTextureLoader(g_loadingManager);
        this.skyTextureLoader.setPath("assets/textures/cube/sunnysky/");

        this.skyBox = this.skyTextureLoader.load(["px.jpg", "nx.jpg", "py.jpg", "ny.jpg", "pz.jpg", "nz.jpg"]);
        this.skyScene = new THREE.Scene();
        this.fov = g_camera.fov;
        this.skyCamera = new THREE.PerspectiveCamera(this.fov, window.innerWidth / window.innerHeight, 1, 1000);

        this.skyScene.add(this.skyCamera);

        this.shader = THREE.ShaderLib["cube"];

        this.material = new THREE.ShaderMaterial({
            fragmentShader: this.shader.fragmentShader,
            vertexShader: this.shader.vertexShader,
            uniforms: this.shader.uniforms,
            depthWrite: false,
            side: THREE.BackSide,
        });

        this.material.uniforms["tCube"].value = this.skyBox;

        this.mesh = new THREE.Mesh(new THREE.SphereBufferGeometry(10, 32, 32), this.material);
        this.skyScene.add(this.mesh);

        window.addEventListener("resize", this.callback.bind(this), false);
    }

    update(sc_camera, sc_renderer) {
        this.skyScene.rotation.y += 0.0002;
        this.skyCamera.quaternion.copy(sc_camera.getWorldQuaternion());
        sc_renderer.render(this.skyScene, this.skyCamera);
    }

    callback = function () {
        console.log("SC Callback")
        var width = window.innerWidth;
        var height = window.innerHeight;
        skyCamera.aspect = width / height;
        skyCamera.updateProjectionMatrix();
    }
    
}

// ANOTHER_GLOBAL_ITEM
//g_skyCube = new SkyCube();
