// muzzleParticls

class MuzzleParticles {
    constructor() {
        // Create particle group and emitter
        this.loader = new THREE.TextureLoader(g_loadingManager);
        this.texture = this.loader.load("assets/textures/img/spark1.png");

        this.particleGroup = new SPE.Group({
            texture: {
                value: this.texture,
            },
            maxParticleCount: 2000,
        });

        this.emitter = new SPE.Emitter({
            type: SPE.distributions.SPHERE,
            activeMultiplier: 2,
            duration: 0.07,
            maxAge: {
                value: 0.05
            },
            position: {
                radius: 0.00,
                value: new THREE.Vector3( 0, 0, 0 ),
                spread: new THREE.Vector3( 0.05, 0.05, 0.02 ),
                distribution: SPE.distributions.SPHERE
            },
    
            size: {
                value: [ 0.1, 0.1, 0.02 ],
                spread: [ 0.1, 0, 0 ]
            },
    
            velocity: {
                value: new THREE.Vector3( 0.0, 0, -10 ),
                spread: new THREE.Vector3( 1, 0, 10.5 ),
                distribution: SPE.distributions.BOX
            },
    
            acceleration: {
                distribution: SPE.distributions.SPHERE,
                value: new THREE.Vector3( 5, 5, 2 ),
            },
    
            drag: {
                value: 0.3
            },
    
            color: {
                value: [ new THREE.Color( 0xCCAA99 ), new THREE.Color( 0xf2fF00 ) ],
                spread: [ new THREE.Vector3( 1, 5, 0 ), new THREE.Vector3(1, 5, 0) ]
            },
    
            opacity: {
                value: [ 1, 0.1 ]
            },
    
            particleCount: 200
        });

        this.particleGroup.addPool(10, this.emitter, true);

    }
}

