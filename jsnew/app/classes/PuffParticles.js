// muzzleParticls

class PuffParticles {
    constructor() {
        // Create particle group and emitter
        this.loader = new THREE.TextureLoader(g_loadingManager);
        this.texture = this.loader.load("assets/textures/img/spark1.png");

        this.velocityMagnitude = 0.3;
        this.velocitySpread = new THREE.Vector3(0.2, 0, 0.2);
        this.texture = this.loader.load("assets/textures/img/fx_smoke.png");

        this.particleGroup = new SPE.Group({
            texture: {
                value: this.texture,
            },
            maxParticleCount: 2000,
        });

        this.emitter = new SPE.Emitter({
            type: SPE.distributions.CUBE,
            duration: 0.02,
            maxAge: {
                value: 1,
            },
            position: {
                value: new THREE.Vector3(0, 0, 0),
                spread: new THREE.Vector3(0.05, 0.05, 0.05),
            },

            size: {
                value: [0.2, 0.6, 0.8],
            },

            velocity: {
                value: new THREE.Vector3(0, this.velocityMagnitude, 0),
                spread: this.velocitySpread,
            },

            acceleration: {
                value: new THREE.Vector3(0, -0.1, 0),
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

        this.particleGroup.addPool(20, this.emitter, true);
        this.particleGroup.mesh.frustumCulled = false;

        this.particleGroup.setNormal = function(normal) {
            // particles bounce in a proper direction
            let v = this.velocityMagnitude;
            for (let i = 0; i < this.particleGroup.emitters.length; i++) {
                this.particleGroup.emitters[i].velocity.value = new THREE.Vector3(normal.x * v, normal.y * v, normal.z * v);
            }
        }.bind(this);
    }

    
}
