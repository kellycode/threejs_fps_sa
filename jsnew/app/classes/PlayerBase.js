// COULD_BE_A_CLASS



class PlayerBase {
    constructor(hud) {
        this.tools = {};
        this.tools.flashlight = {};
        let playerMesh = g_fpsMoverInstance.getControls().getObject();
        this._playerMesh = playerMesh;
        this.target = undefined;
        this.hud = hud;
        this.inHands;
        this.weapons = [];

        this.raycaster = new THREE.Raycaster();
    }

    getPawn() {
        return this._playerMesh;
    };

    // mousewheel selection
    selectWeapon(delta) {
        let currentIndex = this.weapons.indexOf(this.inHands);
        let size = 0;
        let select = currentIndex - delta;
    
        for (let key in this.weapons) {
            if (this.weapons.hasOwnProperty(key)) size++;
        }
    
        // select the first weapon after last weapon and vice versa
        if (select > size - 1) {
            select = 0;
        } else if (select < 0) {
            select = size - 1;
        }
    
        this.switchWeapon(select);
    }

    switchWeapon(number) {
        if (!this.inHands instanceof Weapon) {
            return false;
        }
    
        let fsm = this.inHands.fsm;
        let aimfsm = this.inHands.aimfsm;
    
        if (fsm.is("reloading")) {
            return false;
        }
    
        // transition back from aiming
        if (this.inHands.aiming === true) {
            this.inHands.aim();
        }
    
        let newWeapon = number || 0;
    
        //todo: only make material invisible, not object
        this.inHands.mesh.traverseVisible(function (object) {
            object.visible = false;
        });
    
        this.inHands = this.weapons[newWeapon];
    
        this.inHands.activate();
    }

    LMB() {
        if (this.inHands instanceof Weapon) {
            this.inHands.shoot();
        }
    }

    RMB() {
        if (this.inHands instanceof Weapon) {
            this.inHands.aim();
        }
    }

    use() {
        console.log("Attempting to use an old method"); return;
        let hudElement = this.hud.infoText;
        if (hudElement.visible) {
            hudElement.fadeOut();
        }
    
        if (this.tools.flashlight.pickedUp) {
            this.tools.flashlight.toggle();
        }
    }

    interact() {
        console.log("Attempting to use an old method"); return;
        let object = this.target;
        // dont do nuffin if no object is in target
        if (object === undefined) {
            return false;
        }
    
        let hudElement = this.hud.infoText;
        let interact = object.userData.interact;
    
        if (object.userData.fsm !== undefined) {
            let fsm = object.userData.fsm;
    
            if (isFunction(fsm.interact)) {
                fsm.interact();
            }
        } else if (object.userData instanceof Item) {
            if (isFunction(object.userData.interact)) {
                object.userData.interact(hudElement);
                this.inventar.addItem(object.userData);
            }
        } else if (object.userData instanceof Itemslot || isFunction(object.userData.interact)) {
            object.userData.interact(this.inventar);
        } else {
            console.warn("Object has no interaction", object);
        }
    }

    update(g_delta) {
        // was used for interactions
        //this.raycast(objects);
        // move weapon
        this.inHands.update(g_delta);
    }

    // was used for interactions
    raycast(raycastArray) {
        console.log("Attempting to use an old method"); return;
        let intersections;
        let interactionDistance;
    
        this.raycaster.set(g_fpsMoverInstance.getControls().getObject().getWorldPosition(), camera.getWorldDirection());
        // WAS intersections = raycaster.intersectObjects(objects, false);
        // intersectObjects expects an array and objects isn't an array
        intersections = this.raycaster.intersectObjects(raycastArray, false);
    
        if (intersections.length > 0) {
            let target = intersections[0];
    
            if (target.distance < interactionDistance) {
                // was used for interactions
                this.setTarget(target.object);
            } else {
                this.resetActive();
            }
        } else {
            this.resetActive();
        }
    }

    // was used for interactions
    setTarget(object) {
        console.log("Attempting to use an old method"); return;
        if (object !== this.target) {
            this.resetActive();
            // todo check for interaction class item
            // instead of ausschlussverfahren
            let isItem = object.userData instanceof Item;
            let isItemslot = object.userData instanceof Itemslot;
    
            if (!isItem && !isItemslot) {
                // Object Three.GridHelper
                let hasFSM = isFunction(object.userData.fsm.transitions);
    
                if (hasFSM) {
                    let action = object.userData.fsm.transitions()[0] + " the ";
                    let text = action + object.userData.name;
                }
            } else if (isAnyObject(object.userData.hud)) {
                let action = object.userData.hud.action;
                let text = action + " <span class='highlight-item'>" + object.userData.name + "</span>";
            }
    
            this.hud.interactionText.show(true, text);
            object.userData.highlight(this.inventar, this.hud.interactionText);
            this.target = object;
        }
    }

    resetActive() {
        console.log("Attempting to use an old method"); return;
        if (this.target !== undefined) {
            this.hud.interactionText.show(false);
    
            if (isFunction(this.target.userData.reset)) {
                this.target.userData.reset();
            }
            this.target = undefined;
        }
    }

    isAnyObject(value) {
        console.log("Attempting to use an old method"); return;
        return value != null && (typeof value === "object" || typeof value === "function");
    }

    isFunction(v) {
        console.log("Attempting to use an old method"); return;
        if (v instanceof Function) {
            return true;
        }
    }
}
