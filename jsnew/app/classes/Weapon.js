class Weapon {
    constructor(mesh, statusText) {
        this.statusText = statusText;

        // gun attributes
        this.name = "";
        this.maxCapacity = 30;
        this.currentCapacity = this.maxCapacity;
        this.magazines = 3;
        this.shootDelay = 1;

        // sounds
        this.shootSound;
        this.reloadSound;
        this.emptySound;

        // weapon state
        this.fsm = new WeaponStateMachine(this).fsm;

        // model
        this.mesh = mesh;
        this.originPos = mesh.position.clone();
        this.originRot = mesh.rotation.clone();
        this.ironSightPosition = new THREE.Vector3(0, 0, 0);
        this.ironSightRotation = new THREE.Vector3(0, 0, 0);

        // iron sights
        this.aiming = false;
        this.transition = false;

        // physical
        this.power = 50;

        // particles
        this.muzzleParticls = new MuzzleParticles().particleGroup;
        g_scene.add(this.muzzleParticls.mesh);

        this.puffParticls = new PuffParticles().particleGroup;
        g_scene.add(this.puffParticls.mesh)

        this.lastShotFired = 0;

        this.impactPosition = new THREE.Vector3();

        this.swayFactor = 0;
        this.swayPosition = new THREE.Vector3();
    }

    toString() {
        return this.name + ": " + this.currentCapacity + "/" + this.maxCapacity * this.magazines + " Ammo";
    }

    activate() {
        // reposition muzzle particle
        // and add to weapon mesh
        // so its position is updated automatically on move

        if (typeof this.muzzleParticls !== "undefined") {
            if (this.mesh.userData.emitterVector !== undefined) {
                this.mesh.add(this.muzzleParticls.mesh);
                // performance
                this.muzzleParticls.mesh.position.copy(this.mesh.userData.emitterVector);
            }
        }
        //todo: only make material invisible, not object
        this.mesh.traverse(function (object) {
            object.visible = true;
        });

        this.onChanged();
    }

    shoot() {
        // if fsm.reloading dont count delay?
        var seconds = new Date() / 1000;

        if (seconds < this.lastShotFired + this.shootDelay) {
            //return false;
        }

        this.lastShotFired = seconds;

        if (this.fsm.current === "ready") {
            this.fsm.fire();
        } else if (this.fsm.current === "emptyMag") {
            this.fsm.reload();
        }
    }

    safePlaySound(p_sound) {
        let audio = p_sound; //.userData.audio;
        if (p_sound instanceof THREE.Audio) {
            if (audio.isPlaying) {
                audio.stop();
                audio.onEnded = function () {
                    audio.play();
                    audio.onEnded = null; // Clear the callback to avoid repeated calls
                };
            } else {
                audio.play();
            }
        } else {
            // else no such audio
            console.log("No such audio as " + p_sound);
            const quick_listener = new THREE.AudioListener();
            const quick_sound = new THREE.Audio(quick_listener);
            const quick_audioLoader = new THREE.AudioLoader();
            quick_audioLoader.load("assets/sounds/rifle_shot.wav", function (buffer) {
                quick_sound.setBuffer(buffer);
                quick_sound.setLoop(false);
                quick_sound.setVolume(1.0);
                quick_sound.play();
            });
        }
    }

    playSound(p_sound) {
        const quick_listener = new THREE.AudioListener();
        const quick_sound = new THREE.Audio(quick_listener);
        const quick_audioLoader = new THREE.AudioLoader();
        quick_sound.setBuffer(p_sound);
        quick_sound.setLoop(false);
        quick_sound.setVolume(1.0);
        quick_sound.play();
    }

    fire() {
        // play sound
        if (this.shootSound) {
            this.playSound(this.shootSound);
        }

        // fire emitter
        this.muzzleParticls.triggerPoolEmitter(1);

        var startPoint = g_fpsMoverInstance.getControls().getObject().getWorldPosition();
        var direction = g_camera.getWorldDirection();

        var intersections = g_physicsFactory.raycast(startPoint, direction);

        if (intersections.length > 0) {
            var target = intersections[0];

            if (target && target.object && typeof target.object.name === "string" && target.object.name.trim() !== "") {
                console.log(`Valid target object name: ${target.object.name}`);
            } else {
                console.warn("Invalid target object name");
                console.log(target);
            }

            // on Hit something trigger hit effect emitter
            this.puffParticls.setNormal(target.normal);
            this.puffParticls.triggerPoolEmitter(1, this.impactPosition.set(target.point.x, target.point.y, target.point.z));

            if (isFinite(target.object.mass)) {
                var from = g_camera.getWorldPosition();
                g_physicsFactory.applyDirectionalImpulse(target, from, this.power);
            }
        }
    }

    // PLAYER_WEAPON_SWAY
    sway(velocity, oldPos, elapsedTime) {
        // sway the weapon as you go
        var t = 5e-3 * (Date.now() % 6283); // = elapsedTime, resets at 30s
        var a = velocity.length();
        var b;
        this.swayFactor *= 0.8; // how fast reposition to zero
        this.swayFactor += 0.001 * a; //how much swing x-axis
        a = this.swayFactor;
        b = 0.2 * a; // how much swing y-axis

        this.swayPosition.set(oldPos.x + a * Math.cos(t), oldPos.y + b * (Math.cos(t * 2) - 1), oldPos.z);

        return this.swayPosition;
    }

    update(g_delta) {
        var velocity = g_fpsMoverInstance.getVelocity();
        var swayPosition = this.sway(velocity, this.originPos);

        this.muzzleParticls.tick(g_delta);
        this.puffParticls.tick(g_delta);

        // only sway when not in iron sights
        if (this.aiming === false) {
            this.mesh.position.copy(swayPosition);
        }
    }

    tweenVector(source, target, time) {
        var time = time || 800;
        return new TWEEN.Tween(source)
            .to(
                {
                    x: target.x,
                    y: target.y,
                    z: target.z,
                },
                time
            )
            .easing(TWEEN.Easing.Sinusoidal.InOut)
            .start();
    }

    enterIronSights(time) {
        setTimeout(
            function () {
                this.aiming = !this.aiming;
                this.transition = false;
            }.bind(this),
            time
        );

        var source = this.mesh.position;
        var target = this.ironSightPosition;
        this.tweenVector(source, target, time);

        var source = this.mesh.rotation;
        var target = this.ironSightRotation;
        this.tweenVector(source, target, time);

        new TWEEN.Tween(g_fpsMoverInstance.crosshair.material).to({ opacity: 0 }, time).start();

        new TWEEN.Tween(g_camera)
            .to({ fov: 40 }, time)
            .easing(TWEEN.Easing.Quartic.InOut)
            .onUpdate(g_camera.updateProjectionMatrix)
            .start();

        // size up particle emitters
        // to show up behind weapon
        var particleGroup = this.muzzleParticls;
        for (var i = 0; i < particleGroup.emitters.length; i++) {
            particleGroup.emitters[i].size.value = [0.3, 0.3, 0.1];
            particleGroup.emitters[i].position.spread = new THREE.Vector3(0.2, 0.2, 0.1);
            particleGroup.emitters[i].acceleration.value = new THREE.Vector3(10, 10, 2);
        }
    }

    leaveIronSights(time) {
        setTimeout(
            function () {
                this.aiming = !this.aiming;
                this.transition = false;
            }.bind(this),
            time
        );

        var source = this.mesh.position;
        var target = this.originPos;
        this.tweenVector(source, target, time);

        var source = this.mesh.rotation;
        var target = this.originRot;
        this.tweenVector(source, target, time);

        new TWEEN.Tween(g_fpsMoverInstance.crosshair.material).to({ opacity: 1 }, time).start();

        new TWEEN.Tween(g_camera)
            .to({ fov: 60 }, time)
            .easing(TWEEN.Easing.Cubic.InOut)
            .onUpdate(g_camera.updateProjectionMatrix)
            .start();

        // reset emitter to default values
        var particleGroup = this.muzzleParticls;
        for (var i = 0; i < particleGroup.emitters.length; i++) {
            particleGroup.emitters[i].size.value = [0.1, 0.1, 0.02];
            particleGroup.emitters[i].position.spread = new THREE.Vector3(0.05, 0.05, 0.02);
            particleGroup.emitters[i].acceleration.value = new THREE.Vector3(5, 5, 2);
        }
    }

    aim(time) {
        // sway -> only vertical when aimed
        // prevent trigger multiple tweens
        if (this.transition === true) {
            return false;
        }

        var time = time || 500;
        this.transition = true;
        if (!this.aiming) {
            // zoom In
            this.enterIronSights(time);
        } else {
            // zoom Out
            this.leaveIronSights(time);
        }
    }

    setIntervalX(callback, delay, repetitions) {
        var x = 0;
        var intervalID = window.setInterval(function () {
            callback(x);

            if (++x === repetitions) {
                window.clearInterval(intervalID);
            }
        }, delay);
    }

    reload(callback, scope) {
        var weapon = this;

        if (this.name === "Shotgun") {
            var missing = this.maxCapacity - this.currentCapacity;

            var numberToReload = missing;
            if (missing > this.magazines * this.maxCapacity) {
                numberToReload = this.magazines * this.maxCapacity;
            }

            var intervalHandle = setIntervalX(
                function (x) {
                    weapon.reloadSound.isPlaying = false;
                    this.playSound(this.reloadSound);
                    //weapon.reloadSound.play();
                    weapon.magazines -= 1 / weapon.maxCapacity;
                    weapon.currentCapacity++;
                    if (weapon.currentCapacity - numberToReload === weapon.maxCapacity - missing) {
                        weapon.fsm.readyToFire();
                    }

                    weapon.onChanged();
                },
                this.reloadTime * 1000,
                numberToReload
            );
        } else {
            this.playSound(this.reloadSound);
            //this.reloadSound.play();

            setTimeout(function () {
                weapon.magazines--;
                weapon.reloading = false;
                weapon.currentCapacity = weapon.maxCapacity;
                weapon.onChanged();
                weapon.fsm.readyToFire();
            }, weapon.reloadTime * 1000);
        }
    }

    restock(number) {
        this.magazines += number;
        this.playSound(this.cling);
        //sounds.cling.play();
        this.onChanged();
    }

    fireEffect(ammoPoint, ammoNormal, body) {}

    setCallback(scope, callbackFunction) {
        this.scope = scope;
        this.callbackFunction = callbackFunction;
    }

    onChanged() {
        if (this.scope != null) {
            this.callbackFunction.call(this.scope);
        }
    }
}
