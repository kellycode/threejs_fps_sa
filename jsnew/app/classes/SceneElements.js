let g_physicsFactory;
let g_loadingManager;
let g_scene;
let g_camera;
let g_scene_container;
let g_stats;
let g_listener;
let g_loadingScreen;
let g_renderer;
let g_skyCube;
let g_fpsMoverInstance;
let g_crosshair;

class SceneElements {
    static initPhysicsFactory() {
        g_physicsFactory = new PhysicsFactory();
    }

    static initListener() {
        g_listener = new THREE.AudioListener();
        g_listener.setMasterVolume(0.5);

        // breaks collisions
        //camera.add(g_listener);

        g_scene.add(g_listener);

        // purpose?
        let SoundControls = {
            master: g_listener.getMasterVolume(),
        };
    }

    static initLights() {
        let ambientLight = new THREE.AmbientLight(0x444444);
        g_scene.add(ambientLight);

        // Spot Top
        let dirLight = addShadowedLight(2.1, 8, 3, 0xffffff, 0.6); //0.6

        function addShadowedLight(x, y, z, color, intensity) {
            let directionalLight = new THREE.DirectionalLight(color, intensity);
            directionalLight.position.set(x, y, z);
            g_scene.add(directionalLight);

            directionalLight.castShadow = true;

            let d = 6;
            directionalLight.shadow.camera.left = -d;
            directionalLight.shadow.camera.right = d;
            directionalLight.shadow.camera.top = d;
            directionalLight.shadow.camera.bottom = -d;

            directionalLight.shadow.camera.near = directionalLight.position.y - d;
            directionalLight.shadow.camera.far = directionalLight.position.y + d;

            directionalLight.shadow.mapSize.width = directionalLight.shadow.mapSize.height = 2048;

            g_scene.add(directionalLight);
        }
    }

    static initStats() {
        g_stats = new Stats();
        g_stats.domElement.style =
            "position:absolute; left:0; bottom: 0; cursor: pointer; opacity: 0.9; z-index: 10000;";
        g_stats.domElement.id = "Stats_Container";
        document.body.appendChild(g_stats.domElement);
    }

    static initSceneContainer() {
        g_scene_container = document.createElement("div");
        g_scene_container.id = "Scene_Container";
        document.body.appendChild(g_scene_container);
    }

    static initCamera() {
        // CAMERA
        let screen_width = window.innerWidth;
        let screen_height = window.innerHeight;
        let aspect = screen_width / screen_height;
        let view_angle = 60;
        let near = 0.1;
        let far = 100;

        g_camera = new THREE.PerspectiveCamera(view_angle, aspect, near, far);

        let resizeCallback = function () {
            let width = window.innerWidth;
            let height = window.innerHeight;

            // notify the renderer of the size change
            g_renderer.setSize(width, height);
            // update the camera
            g_camera.aspect = width / height;
            g_camera.updateProjectionMatrix();
        };

        window.addEventListener("resize", resizeCallback, false);
    }

    static initScene() {
        g_scene = new THREE.Scene();
    }

    static initLoadingManager() {
        g_loadingManager = new THREE.LoadingManager();

        g_loadingManager.onProgress = function (item, loaded, total) {
            if (g_loadingScreen !== undefined) {
                g_loadingScreen.setProgress(loaded, total);
            } else {
                console.log("g_loadingScreen is undefined");
            }
        };

        g_loadingManager.onError = function (url) {
            console.warn("Loading Error", url);
        };
    }

    static initLoadingScreen() {
        let loading_Container = document.getElementById("Loading_Container");

        let progress = document.createElement("progress");
        progress.id = "progress_bar";
        loading_Container.appendChild(progress);
        progress.value = 0;

        let label = document.createElement("p");
        label.id = "progress_text";
        label.className = "progressText";
        label.textContent = "0%";
        loading_Container.appendChild(label);

        let sub = document.createElement("p");
        sub.id = "progress_sub";
        sub.className = "sub";
        sub.textContent = "Processing";
        loading_Container.appendChild(sub);

        g_loadingScreen = {};

        g_loadingScreen.setProgress = function (loaded, total) {
            progress.value = loaded / total;
            // progress.value = 0.5;
            label.textContent = Math.round((loaded / total) * 100) + "%";
            sub.textContent = loaded + "/" + total;
        };

        // this happens but atm, with most
        // things removed, it's very fast so not seen
        g_loadingScreen.complete = function () {
            loading_Container.classList.toggle("fade");
            const progress_el_a = document.getElementById("progress_bar");
            if (progress_el_a) {
                progress_el_a.remove();
            }
            const progress_el_b = document.getElementById("progress_text");
            if (progress_el_b) {
                progress_el_b.remove();
            }
            const progress_el_c = document.getElementById("progress_sub");
            if (progress_el_c) {
                progress_el_c.remove();
            }
            //loading_Container.removeChild(progress);
            setTimeout(function () {
                loading_Container.style.display = "none";
            }, 1000);
        };
    }

    static initRenderer() {
        let screen_width = window.innerWidth;
        let screen_height = window.innerHeight;

        // RENDERER
        g_renderer = new THREE.WebGLRenderer({ antialias: true });
        g_renderer.setSize(screen_width, screen_height);

        g_renderer.shadowMap.enabled = true;
        g_renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        g_renderer.autoClear = false;

        // containerjs_container
        g_scene_container.appendChild(g_renderer.domElement);
    }

    static initSkyCube() {
        g_skyCube = new SkyCube();
    }

    static initEnvironment() {
        // Ground
        let textureLoader = new THREE.TextureLoader(g_loadingManager);
        let texture = textureLoader.load("./assets/images/environment_img_b.jpg");
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(64, 64);
        let item_name = "Ground";
        let plane = g_physicsFactory.createPlane(
            1,
            50,
            50,
            0,
            new THREE.MeshPhongMaterial({ map: texture }),
            item_name
        );
        plane.visible = true;
        plane.name = item_name;
        g_scene.add(plane);

        // BROWNISH BOX
        let box_geometry = new THREE.BoxBufferGeometry(1, 1, 1);
        // note that the `BoxGeometry` arguments are the box's full width, height,
        // and depth, while the parameters for `Goblin.BoxShape` are expressed as half sizes
        let box_material = new THREE.MeshLambertMaterial({ color: 0xaa8833 });
        let dynamic_mesh = new THREE.Mesh(box_geometry, box_material);
        dynamic_mesh.position.set(0, 1, -6);
        dynamic_mesh.name = "Bouncing Box";
        g_scene.add(dynamic_mesh);

        g_physicsFactory.meshToBody(dynamic_mesh, 50);
    }

    static initControls() {
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

        let options = {
            thirdPerson: false,
            reset: function () {
                tweenHelper.resetCamera(600);
            },
        };

        document.addEventListener("keydown", onDocumentKeyDown, false);

        let toggle = true;

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
    }
}

SceneElements.initPhysicsFactory();
SceneElements.initLoadingManager();
SceneElements.initScene();
SceneElements.initCamera();
SceneElements.initSceneContainer();
SceneElements.initStats();
SceneElements.initLights();
SceneElements.initListener();
SceneElements.initLoadingScreen();
SceneElements.initRenderer();
SceneElements.initSkyCube();
SceneElements.initEnvironment();
SceneElements.initControls();