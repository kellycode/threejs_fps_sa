class Player extends PlayerBase {

    constructor(hud) {
        let t_player = super(hud);

        hud.weaponText = hud.box();
    
        hud.weaponText.show(true, t_player.inHands);
        hud.weaponText.setHTML = "";
        hud.weaponText.style =
            "padding:4px; background:rgba( 0, 0, 0, 0.25 ); width: unset; text-align:right; right: 100px;";
    
        function update() {
            hud.weaponText.show(true, this.inHands);
        }
    
        let weapons = g_weapons;//initWeapons(hud);
        
        // register update hud on ammo change and reload
        for (let key in weapons) {
            // set HUD callback
            weapons[key].setCallback(t_player, update);
            // fill players inventar
            t_player.weapons.push(weapons[key]);
            // add weapon models to the scene
            t_player.getPawn().add(weapons[key].mesh);
            // hide all weapon models
            weapons[key].mesh.traverseVisible(function (object) {
                object.visible = true;
            });
        }
    
        t_player.inHands = weapons.shotgun;
    
        for (let key in weapons) {
            weapons[key].mesh.traverseVisible(function (object) {
                object.visible = false;
            });
        }
    
        t_player.switchWeapon(1);
    
        // set to true on keydown and false on keyup
        // poor man's event management
        let toggle = false; // toggle key down 
        let toggle2 = false; // toggle key down
    
        function onDocumentKeyDown(event) {
            event = event || window.event;
            let keycode = event.keyCode;
    
            switch (keycode) {
                case 82: //R
                    if (toggle2) {
                        return;
                    }
                    toggle2 = !toggle2;
                    if (this.inHands instanceof Weapon) {
                        this.inHands.fsm.reload();
                    }
                    break;
            }
        }
    
    
        function onDocumentKeyUp(event) {
            event = event || window.event;
            let keycode = event.keyCode;
    
            switch (keycode) {
                case 69: //E
                    // execute only once on keydown, until reset
                    toggle = false;
                    break;
    
                case 82: //R
                    // execute only once on keydown, until reset
                    toggle2 = false;
                    break;
            }
        }
    
        // ALL app event listeners should be initialized in
        // one location and normally in an event manager
        document.addEventListener("keydown", onDocumentKeyDown.bind(t_player), false);
        document.addEventListener("keyup", onDocumentKeyUp, false);
        document.body.addEventListener("mousedown", handleMouseDown.bind(t_player));
    
    
        function handleMouseDown(event) {
            // cheap way of blocking shooting while entering fullscreen
            // idk. maybe entering fullscreen as different and took longer
            // back then - this isn't needed now
            // if (!g_fpsMoverInstance.getControls().enabled) {
            //     return;
            // }
    
    
            if (event.button === 0) {
                // shoots
                this.LMB();
            } else {
                // aims
                this.RMB();
            }
        }
    
        document.addEventListener("mousewheel", MouseWheelHandler.bind(t_player), false);
        
        function MouseWheelHandler(event) {
            let delta = Math.max(-1, Math.min(1, event.wheelDelta || -event.detail));
            this.selectWeapon(delta);
            return false;
        }
    
        return t_player;
    }
}
