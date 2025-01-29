// PARTICLES: NOT USED ATM

/*
to start:
PARTICLES.triggerPoolEmitter(1, impactPosition.set(0, 0, 0));
in animation loop
PARTICLES.tick( delta );
*/

//TODO: Make this into a Particle (creator) class 

class Particles {
    constructor() {
        this.loader = new THREE.TextureLoader(g_loadingManager);
        this.texture = loader.load("assets/textures/img/star.png");

        this.particleGroup = new SPE.Group({
            texture: {
                value: texture,
            },
            maxParticleCount: 1750,
        });

        this.emitter = new SPE.Emitter({
            type: SPE.distributions.SPHERE,
            activeMultiplier: 2,
            duration: 1000000.07,
            maxAge: {
                value: 0.4,
            },
            position: {
                radius: 0.4,
                spread: new THREE.Vector3(0.1, 0.1, 0.1),
            },

            velocity: {
                value: new THREE.Vector3(-1, -1, -1),
                distribution: SPE.distributions.SPHERE,
            },

            acceleration: {
                value: new THREE.Vector3(-0.5, -0.5, -0.5),
                distribution: SPE.distributions.SPHERE,
            },

            drag: {
                value: 0.4,
            },

            color: {
                value: [new THREE.Color(0xd2ff00), new THREE.Color(0xffc200)],
            },

            opacity: {
                value: [0, 0.2, 0.4, 0.0],
            },

            size: {
                value: 10.05,
                spread: [0.1, 0.2, 0.1],
            },

            particleCount: 10,
        });

        this.particleGroup.addPool(3, this.emitter, true);
    }
}

/*
Usage:

var PARTICLES = new Particles_Generic().particleGroup;
g_scene.add(PARTICLES.mesh);
PARTICLES.mesh.position.set(0, 1, 0);
PARTICLES.triggerPoolEmitter(1);

in animation loop:

PARTICLES.tick(g_delta);
*/

