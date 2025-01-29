// ALMOST_A_CLASS

class PointerLock {
    constructor(camera, domElement) {

        this.camera = camera;
        this.domElement = domElement;

        this.camera.rotation.set(0, 0, 0);

        this.pitchObject = new THREE.Object3D();
        this.pitchObject.add(camera);

        this.PI_2 = Math.PI / 2;

        // this.anabled doesn't seem to have a raison d’être
        //this.enabled = false;
        this.yRotation = this.pitchObject.rotation.y;

        // stops follow mouse movements
        // when pointer lock is engaged
        this.controlsDisabled = false;

        this.forward = false;
        this.back = false;
        this.left = false;
        this.right = false;
        this.spacebar = false;
        this.shift = false;

        document.addEventListener("mousemove", this.onMouseMove.bind(this), false);
        document.addEventListener("mousedown", this.onMouseDown.bind(this), false);
        document.addEventListener("keydown", this.onKeyDown.bind(this), false);
        document.addEventListener("keyup", this.onKeyUp.bind(this), false);

        document.addEventListener("mousewheel", this.mouseWheelHandler, false);

        this.fullscreen(this, this.domElement);

    }

    onMouseMove(event) {
        if (this.controlsDisabled) return;

        let movementX = event.movementX || 0;
        let movementY = event.movementY || 0;
        this.yRotation -= movementX * 0.002;
        this.pitchObject.rotation.x -= movementY * 0.002;
        // limit movement
        this.pitchObject.rotation.x = Math.max(-this.PI_2, Math.min(this.PI_2, this.pitchObject.rotation.x));
    }

    // THESE ARE HANDLED IN PLAYER.JS
    onMouseDown(event) {
        return;
    }

    mouseWheelHandler(event) {
        // cross-browser wheel delta
        //let delta = Math.max(-1, Math.min(1, event.wheelDelta || -event.detail));
        return false;
    }

    resetRotation() {
        this.setYRotation(0);
        this.pitchObject.rotation.x = 0;
    };

    getObject() {
        return this.pitchObject;
        // return yawObject;
    };

    getYRotation() {
        return this.yRotation;
    };

    setYRotation(value) {
        this.yRotation = value;
    };


    onKeyDown(event) {
        switch (event.keyCode) {
            case 70: //f
                break;

            case 9: //tabulator
                break;

            case 38: // up
            case 87: // w
                this.forward = true;
                break;

            case 37: // left
            case 65: // a
                this.left = true;
                break;

            case 40: // down
            case 83: // s
                this.back = true;
                break;

            case 39: // right
            case 68: // d
                this.right = true;
                break;

            case 32: // space
                this.spacebar = true;
                break;

            case 16: // shift
                this.shift = true;
                break;

            case 70: // f
                // fullscreen();
                break;

            case 69: // e
                break;

            case 81: // q
                break;

            case 82: // r
                break;

            case 49: //1
                // selectWeapon( 0 );
                break;

            case 50: //2
                // selectWeapon( 1 );
                break;

            case 51: //3
                // selectWeapon( 2 );
                break;

            case 52: //4
                // selectWeapon( 3 );
                break;
        }
    };

    onKeyUp(event) {
        switch (event.keyCode) {
            case 9: // tab
                // centerDiv.style.cssText="visibility:hidden;"
                break;

            case 38: // up
            case 87: // w
                this.forward = false;
                // moveForward = false;
                break;

            case 37: // left
            case 65: // a
                this.left = false;
                // moveLeft = false;
                break;

            case 40: // down
            case 83: // s
                this.back = false;
                // moveBackward = false;
                break;

            case 39: // right
            case 68: // d
                this.right = false;
                // moveRight = false;
                break;

            case 16: // shift
                this.shift = false;
                // this.shift = false;
                break;

            case 32: // space
                break;

            case 69: //e
                // env.player.toggle = false;
                // player.toggle = false;
                break;
        }
    };

    fullscreen(boss, domElement) {

        let blocker_div = document.createElement("div");
        blocker_div.id = "Blocker_Div";
        blocker_div.style = "background: transparent";
        document.body.insertBefore(blocker_div, domElement);

        let instructions_div = document.createElement("div");
        instructions_div.innerHTML = '<span style="font-size:40px">Click to play</span>';
        instructions_div.innerHTML += "<br>(W, A, S, D = Move, SPACE = Jump, MOUSE = Look around)";
        instructions_div.innerHTML += "<br>LMB = Shoot, RMB = Aim";
        instructions_div.innerHTML += "<br>Q = toggle third person camera";
        instructions_div.id = "Instructions_Div";
        instructions_div.style = "opacity:0.5";

        blocker_div.appendChild(instructions_div);

        // maybe for testing?
        let wantPointerLock = true;

        if (wantPointerLock) {
            let element = document.body;

            let pointerlockchange = function (event) {
                if (document.pointerLockElement === element) {
                    //this.enabled = true;
                    this.controlsDisabled = false;
                    blocker_div.style.display = "none";
                } else {
                    //this.enabled = false;
                    this.controlsDisabled = true;
                    blocker_div.style.display = "block";
                    instructions_div.style.display = "";
                }
            }.bind(this);

            let pointerlockerror = function (event) {
                instructions_div.style.display = "";
            };

            // Hook pointer lock state change events
            document.addEventListener("pointerlockchange", pointerlockchange, false);

            document.addEventListener("pointerlockerror", pointerlockerror, false);

            // removes the instructions
            document.addEventListener(
                "click",
                function (event) {
                    instructions_div.style.display = "none";
                    // Ask the browser to lock the pointer
                    element.requestPointerLock();
                },
                false
            );
        } else {
            instructions_div.innerHTML = "Your browser doesn't seem to support Pointer Lock API";
        }
    }
}

