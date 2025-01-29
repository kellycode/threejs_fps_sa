function setIntervalX(callback, delay, repetitions) {
    var x = 0;
    var intervalID = window.setInterval(function () {
        callback(x);

        if (++x === repetitions) {
            window.clearInterval(intervalID);
        }
    }, delay);
}

function Weapon(mesh, statusText) {
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
    this.fsm = weaponStateMachine(this);

    // model
    this.mesh = mesh;
    // mesh.updateMatrix();
    // var position = new THREE.Vector3().setFromMatrixPosition( mesh.matrix );
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
    this.muzzleParticls = muzzleParticls;

    //folder.add(this, "power").min(1).max(100).listen();
}

Weapon.prototype.toString = function () {
    return this.name + ": " + this.currentCapacity + "/" + this.maxCapacity * this.magazines + " Ammo";
};

Weapon.prototype.activate = function () {
    // reposition muzzle particle
    // and add to weapon mesh
    // so its position is updated automatically on move

    if (typeof this.muzzleParticls !== "undefined") {
        if (this.mesh.userData.emitterVector !== undefined) {
            this.mesh.add(this.muzzleParticls.mesh);
            // performance
            // this.muzzleParticls.mesh.matrixAutoUpdate = false;
            this.muzzleParticls.mesh.position.copy(this.mesh.userData.emitterVector);

            // this.mesh.add( emitterHelper );
            // emitterHelper.position.copy( this.mesh.userData.emitterVector );
        }
        // emitterHelper.position.copy( this.mesh.emitterVector );
    }
    //todo: only make material invisible, not object
    this.mesh.traverse(function (object) {
        object.visible = true;
    });

    this.onChanged();
};

var lastShotFired = 0;
Weapon.prototype.shoot = function () {
    // if fsm.reloading dont count delay?

    var seconds = new Date() / 1000;

    if (seconds < lastShotFired + this.shootDelay) {
        //return false;
    }

    lastShotFired = seconds;

    if (this.fsm.current === "ready") {
        this.fsm.fire();
    } else if (this.fsm.current === "emptyMag") {
        this.fsm.reload();
    }
};

var impactPosition = new THREE.Vector3();

function safePlaySound(p_sound) {
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
        const test_listener = new THREE.AudioListener();
        const test_sound = new THREE.Audio(test_listener);
        const test_audioLoader = new THREE.AudioLoader();
        test_audioLoader.load("assets/sounds/rifle_shot.wav", function (buffer) {
            test_sound.setBuffer(buffer);
            test_sound.setLoop(false);
            test_sound.setVolume(1.0);
            test_sound.play();
        });
    }
}

function playSound(p_sound) {
    const test_listener = new THREE.AudioListener();
    const test_sound = new THREE.Audio(test_listener);
    const test_audioLoader = new THREE.AudioLoader();
    test_sound.setBuffer(p_sound);
    test_sound.setLoop(false);
    test_sound.setVolume(1.0);
    test_sound.play();
}

Weapon.prototype.fire = function () {
    var lll = listener;
    // play sound
    if (this.shootSound) {
        playSound(this.shootSound);
    }

    // fire emitter
    this.muzzleParticls.triggerPoolEmitter(1);

    var startPoint = fpsMoverInstance.getControls().getObject().getWorldPosition();
    var direction = camera.getWorldDirection();

    var intersections = physicsFactory.raycast(startPoint, direction);

    if (intersections.length > 0) {
        var target = intersections[0];

        if (target && target.object && typeof target.object.name === "string" && target.object.name.trim() !== "") {
            console.log(`Valid target object name: ${target.object.name}`);
        } else {
            console.warn("Invalid target object name");
            console.log(target);
        }

        // on Hit something trigger hit effect emitter
        puffParticls.setNormal(target.normal);
        puffParticls.triggerPoolEmitter(1, impactPosition.set(target.point.x, target.point.y, target.point.z));

        if (isFinite(target.object.mass)) {
            var from = camera.getWorldPosition();
            physicsFactory.applyDirectionalImpulse(target, from, this.power);
        }
    }
};

var swayFactor = 0;
var swayPosition = new THREE.Vector3();

// PLAYER_WEAPON_SWAY
function sway(velocity, oldPos, elapsedTime) {
    // sway the weapon as you go
    var t = 5e-3 * (Date.now() % 6283); // = elapsedTime, resets at 30s
    var a = velocity.length();
    var b;
    swayFactor *= 0.8; // how fast reposition to zero
    swayFactor += 0.001 * a; //how much swing x-axis
    a = swayFactor;
    b = 0.2 * a; // how much swing y-axis

    swayPosition.set(oldPos.x + a * Math.cos(t), oldPos.y + b * (Math.cos(t * 2) - 1), oldPos.z);

    return swayPosition;
}

Weapon.prototype.update = function () {
    var velocity = fpsMoverInstance.getVelocity();
    var swayPosition = sway(velocity, this.originPos);

    // only sway when not in iron sights
    if (this.aiming === false) {
        this.mesh.position.copy(swayPosition);
    }
};

function tweenVector(source, target, time) {
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

Weapon.prototype.enterIronSights = function (time) {
    setTimeout(
        function () {
            this.aiming = !this.aiming;
            this.transition = false;
        }.bind(this),
        time
    );

    var source = this.mesh.position;
    var target = this.ironSightPosition;
    tweenVector(source, target, time);

    var source = this.mesh.rotation;
    var target = this.ironSightRotation;
    tweenVector(source, target, time);

    new TWEEN.Tween(fpsMoverInstance.crosshair.material).to({ opacity: 0 }, time).start();

    new TWEEN.Tween(camera)
        .to({ fov: 40 }, time)
        .easing(TWEEN.Easing.Quartic.InOut)
        .onUpdate(camera.updateProjectionMatrix)
        .start();

    // size up particle emitters
    // to show up behind weapon
    var particleGroup = this.muzzleParticls;
    for (var i = 0; i < particleGroup.emitters.length; i++) {
        particleGroup.emitters[i].size.value = [0.3, 0.3, 0.1];
        particleGroup.emitters[i].position.spread = new THREE.Vector3(0.2, 0.2, 0.1);
        particleGroup.emitters[i].acceleration.value = new THREE.Vector3(10, 10, 2);
    }
};

Weapon.prototype.leaveIronSights = function (time) {
    setTimeout(
        function () {
            this.aiming = !this.aiming;
            this.transition = false;
        }.bind(this),
        time
    );

    var source = this.mesh.position;
    var target = this.originPos;
    tweenVector(source, target, time);

    var source = this.mesh.rotation;
    var target = this.originRot;
    tweenVector(source, target, time);

    new TWEEN.Tween(fpsMoverInstance.crosshair.material).to({ opacity: 1 }, time).start();

    new TWEEN.Tween(camera)
        .to({ fov: 60 }, time)
        .easing(TWEEN.Easing.Cubic.InOut)
        .onUpdate(camera.updateProjectionMatrix)
        .start();

    // reset emitter to default values
    var particleGroup = this.muzzleParticls;
    for (var i = 0; i < particleGroup.emitters.length; i++) {
        particleGroup.emitters[i].size.value = [0.1, 0.1, 0.02];
        particleGroup.emitters[i].position.spread = new THREE.Vector3(0.05, 0.05, 0.02);
        particleGroup.emitters[i].acceleration.value = new THREE.Vector3(5, 5, 2);
    }
};

Weapon.prototype.aim = function (time) {
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
};

Weapon.prototype.reload = function (callback, scope) {
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
                weapon.reloadSound.play();
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
        this.reloadSound.play();

        setTimeout(function () {
            weapon.magazines--;
            weapon.reloading = false;
            weapon.currentCapacity = weapon.maxCapacity;
            weapon.onChanged();
            weapon.fsm.readyToFire();
        }, weapon.reloadTime * 1000);
    }
};

Weapon.prototype.restock = function (number) {
    this.magazines += number;
    sounds.cling.play();
    this.onChanged();
};

Weapon.prototype.fireEffect = function (ammoPoint, ammoNormal, body) {};

Weapon.prototype.setCallback = function (scope, callbackFunction) {
    this.scope = scope;
    this.callbackFunction = callbackFunction;
};

Weapon.prototype.onChanged = function () {
    if (this.scope != null) {
        this.callbackFunction.call(this.scope);
    }
};
