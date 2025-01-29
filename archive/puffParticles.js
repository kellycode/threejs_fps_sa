

// Create particle group and emitter
var loader = new THREE.TextureLoader(g_loadingManager);

// Impact Puffs
var velocityMagnitude = 0.3;
var velocitySpread = new THREE.Vector3(0.2, 0, 0.2);
var texture = loader.load("assets/textures/img/fx_smoke.png");

var particleGroup = new SPE.Group({
    texture: {
        value: texture,
    },
    blending: THREE.NormalBlending,
    maxParticleCount: 1000,
});

particleGroup.setNormal = function (normal) {
    var v = velocityMagnitude;
    for (var i = 0; i < this.emitters.length; i++) {
        this.emitters[i].velocity.value = new THREE.Vector3(normal.x * v, normal.y * v, normal.z * v);
    }
};

var emitter = new SPE.Emitter({
    type: SPE.distributions.CUBE,
    duration: 0.02,
    maxAge: {
        value: 1,
    },
    position: {
        value: new THREE.Vector3(0, 0, 0),
        spread: new THREE.Vector3(0.05, 0.05, 0.05)
    },

    size: {
        value: [0.2, 0.6, 0.8],
    },

    velocity: {
        value: new THREE.Vector3(0, velocityMagnitude, 0),
        spread: velocitySpread
    },

    acceleration: {
        value: new THREE.Vector3(0, -0.1, 0)
    },

    color: {
        value: [new THREE.Color(0xc8bb93), new THREE.Color(0xc8bb93)],
    },

    opacity: {
        value: [0.1, 0.05, 0.0],
        spread: [0.10556, 0.05, 0],
    },

    particleCount: 50,
});

particleGroup.addPool(20, emitter, true);

particleGroup.mesh.frustumCulled = false;

var puffParticls = particleGroup;

g_scene.add(particleGroup.mesh);
