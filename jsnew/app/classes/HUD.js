class HUD {
    constructor(domElement) {
        var hud_container = document.createElement("div");
        hud_container.id = "Hud_Container";
        hud_container.className = "hud_container";
        document.body.insertBefore(hud_container, domElement);
        this.hud_container = hud_container;
    }

    box(message) {
        var infoText = document.createElement("div");

        this.infoText = infoText;

        infoText.id = "InfoText_Container";
        infoText.className = "infoText";
        infoText.initial = message || "";
        infoText.innerHTML = message;

        this.hud_container.appendChild(infoText);

        infoText.played = false;
        infoText.autoFadeOut = false;
        infoText.visible = false;

        infoText.setText = function (text) {
            this.innerHTML = this.initial + " " + text;
        };
        infoText.setHTML = function (text) {
            this.innerHTML = text;
        };

        infoText.show = function (value, message) {
            this.played = true;

            if (message) {
                this.innerHTML = this.initial + " " + message;
            }

            if (value) {
                this.fadeIn();
            } else {
                this.fadeOut();
            }
        };

        infoText.fadeIn = function () {
            this.classList.remove("fadeOut");
            this.classList.remove("animate");
            this.classList.add("animate");
            this.autoFadeOut = false;
            this.visible = true;
        };

        // fade out after 2s
        // if faded out automatically,
        // cancel the fadeOut on losing active state
        // kill the scheduled auto fadeout
        infoText.fadeOut = function (value) {
            if (this.autoFadeOut) {
                return;
            }
            if (value) {
                this.autoFadeOut = true;
            }
            clearTimeout(this.currentTimeout);

            this.visible = false;

            this.classList.remove("fadeIn");
            this.classList.remove("fadeOut");
            this.offsetWidth = this.offsetWidth;
            this.classList.add("fadeOut");
        };

        return infoText;
    }
}
