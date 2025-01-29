function weaponStateMachine(weapon) {
    // states: ready, fireing, reloading, emptyMag, outOfAmmo
    // events: fire, readyToFire, reload, empty, emptyFire

    var fsm = StateMachine.create({
        initial: "ready",
        events: [
            // { name: 'reset', from: '*',  to: 'locked' },
            { name: "readyToFire", from: ["fireing", "reloading"], to: "ready" },
            { name: "fire", from: ["ready", "outOfAmmo"], to: "fireing" },
            { name: "fire", from: "emptyMag", to: "reloading" },
            { name: "reload", from: ["emptyMag", "ready", "outOfAmmo"], to: "reloading" },
            { name: "empty", from: "fireing", to: "emptyMag" },
            { name: "emptyFire", from: "emptyMag", to: "outOfAmmo" },
            // { name: 'restock', from: '*', to: 'restocking' },
        ],
        callbacks: {

            onfireing: function () {
                if (weapon.currentCapacity > 0) {
                    weapon.fire();
                    weapon.currentCapacity -= 1;
                    weapon.onChanged();
                }

                // ready to fire another?
                if (weapon.currentCapacity > 0) {
                    // yes, lets go
                    fsm.readyToFire();
                } else {
                    fsm.empty();
                }
            },

            onemptyFire: function () {
                // sound click
                sounds.weaponclick.play();
            },

            onemptyMag: function () {
                if (weapon.magazines <= 0) {
                    fsm.emptyFire();

                    // } else {

                    // weapon.statusText.show( true, "press <span class='highlight-actionkey'>[ R ]</span> to reload " + weapon.name );
                } else if (weapon.magazines > 0 && weapon.emptySound instanceof THREE.Audio) {
                    weapon.emptySound.play();
                }
            },

            onbeforereload: function () {
                // stop reloading without magazines left
                // and if magazines full, stop too ofc -.-
                var fullMagazines = weapon.maxCapacity === weapon.currentCapacity;
                var noMagazinesLeft = weapon.magazines <= 0;

                if (noMagazinesLeft || fullMagazines) {
                    return false;
                }
            },

            onreloading: function () {
                weapon.reload(fsm.readyToFire, fsm);
            },
        },
    });

    return fsm;

}
