class WeaponLoader {
    constructor(preloaded, g_sounds) {
        this.preloadedTextures = preloaded.textures;
        this.preloadedModels = preloaded.models;
        this.sounds = g_sounds;

        this.loadedWeapons = {};

        this.t_shotgun = this.preloadedTextures["assets/models/ithaca/M37_diffuse.jpg"];
        this.t_shotgun_n = this.preloadedTextures["assets/models/ithaca/M37_normal.jpg"];
        this.t_shells = this.preloadedTextures["assets/models/ithaca/Shells_diffuse.jpg"];
        this.t_shells_n = this.preloadedTextures["assets/models/ithaca/Shells_normal.jpg"];
        this.t_shotgun_s = this.preloadedTextures["assets/models/ithaca/M37_specular.jpg"];
        this.m_shotgunMesh = this.preloadedModels["assets/models/ithaca/m37_tris.obj"];

        this.t_sniper = this.preloadedTextures["assets/models/mk14/MK14.jpg"];
        this.t_sniper_n = this.preloadedTextures["assets/models/mk14/MK14_normalprot.jpg"];
        this.t_sniper_s = this.preloadedTextures["assets/models/mk14/MK14_specular.jpg"];
        this.m_sniperMesh = this.preloadedModels["assets/models/mk14/MK14.obj"];

        this.t_rifle = this.preloadedTextures["assets/models/g36c/mat/g36c_d_fin.jpg"];
        this.t_rifle_n = this.preloadedTextures["assets/models/g36c/mat/g36c_n_fin.jpg"];
        this.t_rifle_s = this.preloadedTextures["assets/models/g36c/mat/g36c_spec.jpg"];
        this.t_rifle_ao = this.preloadedTextures["assets/models/g36c/mat/basic/g36c_bake_ao.png"];
        this.t_rifle_l = this.preloadedTextures["assets/models/g36c/mat/basic/g36c_bake_general_light_fine.png"];
        this.m_rifleMesh = this.preloadedModels["assets/models/g36c/g36c_arby26.obj"];
    }

    loadWeapons() {
        this.initIthaca(this.m_shotgunMesh);
        this.initMK14(this.m_sniperMesh);
        this.initG36C(this.m_rifleMesh);

        return this.loadedWeapons;
    }

    initWeapons(loadedWeapons) {
        var shotgun = new Weapon(loadedWeapons.shotgun);
        shotgun.name = "Shotgun";
        shotgun.maxCapacity = 8;
        shotgun.currentCapacity = 8;
        shotgun.magazines = 1;
        shotgun.shootDelay = 0.15;
        let g_sounds = g_allSounds.sounds;
        shotgun.shootSound = this.sounds.railgun;
        shotgun.reloadSound = this.sounds.shellload;
        shotgun.reloadTime = 0.3;
        shotgun.power = 20;
        shotgun.ironSightPosition = new THREE.Vector3(0.014, -0.03, shotgun.mesh.position.z + 0.15);
    
        var sniper = new Weapon(loadedWeapons.sniper);
        sniper.name = "MK 14";
        sniper.maxCapacity = 6;
        sniper.currentCapacity = 6;
        sniper.magazines = 5;
        sniper.reloadTime = 4;
        sniper.shootDelay = 0.8;
        sniper.power = 100;
        sniper.shootSound = this.sounds.rifleshot;
        sniper.reloadSound = this.sounds.sniperreload;
        sniper.emptySound = this.sounds.cling;
        sniper.ironSightPosition = new THREE.Vector3(0.006, -0.125, sniper.mesh.position.z);
        sniper.ironSightRotation = new THREE.Vector3(0, (0.0 * Math.PI) / 180, 0);
        // weapons.add( sniper.mesh );
    
        var rifle = new Weapon(loadedWeapons.rifle);
        rifle.name = "G36C";
        rifle.maxCapacity = 30;
        rifle.currentCapacity = 30;
        rifle.magazines = 2;
        rifle.reloadTime = 3.1;
        rifle.shootDelay = 0.1;
        rifle.power = 50;
        rifle.shootSound = this.sounds.rifleshot;
        rifle.reloadSound = this.sounds.g36reload;
        rifle.ironSightPosition = new THREE.Vector3(0.0, -0.27, rifle.mesh.position.z);
        // weapons.add( rifle.mesh );
    
        return {
            shotgun: shotgun,
            sniper: sniper,
            rifle: rifle,
        };
    }

    gunHelper(mesh, offset) {
        var test = mesh.clone();
        scene.add(test);
        test.position.set(0, 1.2, 0);

        var x = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), new THREE.MeshNormalMaterial({ wireframe: true }));
        test.add(x);
        x.position.copy(offset);
    }

    screenPosition(percentX, percentY, posz) {
        var position = new THREE.Vector3();

        var pyramidPositionX = (percentX / 100) * 2 - 1;
        var pyramidPositionY = (percentY / 100) * 2 - 1;

        position.set(pyramidPositionX * g_camera.aspect, pyramidPositionY, posz);

        return position;
    }

    initIthaca(object) {
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
        material.map = this.t_shotgun;
        material.normalMap = this.t_shotgun_n;
        material.specularMap = this.t_shotgun_s;
        material.specular.setHex(0xffffff);
        material.map.anisotropy = 8; //front barrel of the weapon gets blurry

        var material2 = object.children[2].material.clone();
        material2.map = this.t_shells;
        material2.normalMap = this.t_shells_n;
        object.children[2].material = material2;

        var position = this.screenPosition(54, 42, -0.5);
        object.position.copy(position);

        this.loadedWeapons.shotgun = object;
    }

    initMK14(object) {
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
        material.map = this.t_sniper;
        material.normalMap = this.t_sniper_n;
        material.normalScale.set(-1, -1);
        material.specularMap = this.t_sniper_s;
        material.specular.setHex(0x444444);
        material.shininess = 30;

        object.rotation.x = (-3 * Math.PI) / 180; // - positiv = weiter nach unten

        var position = this.screenPosition(53, 39, -0.5);
        object.position.copy(position);

        this.loadedWeapons.sniper = object;
    }

    initG36C(object) {
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
        material.map = this.t_rifle;
        material.normalMap = this.t_rifle_n;
        material.normalScale.set(-1, -1);
        material.specularMap = this.t_rifle_s;
        material.aoMap = this.t_rifle_ao;

        object.rotation.x = (-3 * Math.PI) / 180;

        var position = this.screenPosition(54, 31, -0.5);
        object.position.copy(position);

        this.loadedWeapons.rifle = object;
    }
}
