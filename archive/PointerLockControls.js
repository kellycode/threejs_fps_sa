// ALMOST_A_CLASS

var PointerLockControls = function (camera, domElement, player) {
    var scope = this;

    //var player = player;
    camera.rotation.set(0, 0, 0);
    var pitchObject = new THREE.Object3D();
    pitchObject.add(camera);
    var PI_2 = Math.PI / 2;
    this.enabled = false;
    var yRotation = pitchObject.rotation.y;

    scope.controlsDisabled = false;

    this.forward = false;
    this.back = false;
    this.left = false;
    this.right = false;
    this.spacebar = false;
    this.shift = false;

    var onMouseMove = function (event) {
        if (scope.controlsDisabled) return;
        var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
        yRotation -= movementX * 0.002;
        pitchObject.rotation.x -= movementY * 0.002;
        // limit movement
        pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2, pitchObject.rotation.x));
    }.bind(this);

    // THESE ARE HANDLED IN PLAYER.JS
    var onMouseDown = function (event) {
        return;
    };

    function MouseWheelHandler(event) {
        // cross-browser wheel delta
        var delta = Math.max(-1, Math.min(1, event.wheelDelta || -event.detail));
        return false;
    }

    var onKeyDown = function (event) {
        switch (event.keyCode) {
            case 70: //f
                break;

            case 9: //tabulator
                break;

            case 38: // up
            case 87: // w
                scope.forward = true;
                break;

            case 37: // left
            case 65: // a
                scope.left = true;
                break;

            case 40: // down
            case 83: // s
                scope.back = true;
                break;

            case 39: // right
            case 68: // d
                scope.right = true;
                break;

            case 32: // space
                scope.spacebar = true;
                break;

            case 16: // shift
                scope.shift = true;
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

    var onKeyUp = function (event) {
        switch (event.keyCode) {
            case 9: // tab
                // centerDiv.style.cssText="visibility:hidden;"
                break;

            case 38: // up
            case 87: // w
                scope.forward = false;
                // moveForward = false;
                break;

            case 37: // left
            case 65: // a
                scope.left = false;
                // moveLeft = false;
                break;

            case 40: // down
            case 83: // s
                scope.back = false;
                // moveBackward = false;
                break;

            case 39: // right
            case 68: // d
                scope.right = false;
                // moveRight = false;
                break;

            case 16: // shift
                scope.shift = false;
                // scope.shift = false;
                break;

            case 32: // space
                break;

            case 69: //e
                // env.player.toggle = false;
                // player.toggle = false;
                break;
        }
    };

    if (document.addEventListener) {
        // IE9, Chrome, Safari, Opera
        document.addEventListener("mousemove", onMouseMove, false);
        document.addEventListener("mousedown", onMouseDown, false);
        document.addEventListener("keydown", onKeyDown, false);
        document.addEventListener("keyup", onKeyUp, false);

        document.addEventListener("mousewheel", MouseWheelHandler, false);
    }

    this.resetRotation = function () {
        this.setYRotation(0);
        pitchObject.rotation.x = 0;
    };

    this.getObject = function () {
        return pitchObject;
        // return yawObject;
    };

    this.getYRotation = function () {
        // console.log("mousemove", yRotation );
        return yRotation;
    };

    this.setYRotation = function (value) {
        yRotation = value;
    };

    fullscreen(this, domElement);

    function fullscreen(pl_controls, fs_container) {
        var g_this = this;

        var blocker_div = document.createElement("div");
        blocker_div.id = "Blocker_Div";
        blocker_div.style = "background: transparent";
        document.body.insertBefore(blocker_div, fs_container);

        var instructions_div = document.createElement("div");
        instructions_div.innerHTML = '<span style="font-size:40px">Click to play</span>';
        instructions_div.innerHTML += "<br>(W, A, S, D = Move, SPACE = Jump, MOUSE = Look around)";
        instructions_div.innerHTML += "<br>LMB = Shoot, RMB = Aim";
        instructions_div.innerHTML += "<br>Q = toggle third person camera";
        instructions_div.id = "Instructions_Div";
        instructions_div.style = "opacity:0.5";


        blocker_div.appendChild(instructions_div);

        var wantPointerLock = false;

        if (wantPointerLock) {
            var element = document.body;

            var pointerlockchange = function (event) {
                if (document.pointerLockElement === element) {
                    pl_controls.enabled = true;
                    scope.controlsDisabled = false;
                    blocker_div.style.display = "none";
                } else {
                    pl_controls.enabled = false;
                    scope.controlsDisabled = true;
                    blocker_div.style.display = "box";
                    instructions_div.style.display = "";
                }
            }.bind(this);

            var pointerlockerror = function (event) {
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
};
