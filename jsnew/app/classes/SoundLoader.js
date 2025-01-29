let ALL_SOUNDS_LENGTH;
let NORMAL_SOUND_PATHS;

let AUDIO_LISTENER;
let AUDIO_LOADER;
let AUDIO_BUFFER;

let LOAD_COUNT;

let POSITIONAL_BOW_PATHS;
let POSITIONAL_SAFE_PATHS;
let POSITIONAL_SICHERUNGSKASTEN_PATHS

let NORMAL_SOUNDS_LENGTH;
let POSITIONALSOUNDSLENGTH;

class SoundLoaderClass {
    constructor(listener, manager, soundLoadCallback) {
        this.soundLoadCallback = soundLoadCallback;
        AUDIO_LISTENER = listener;
        AUDIO_LOADER = new THREE.AudioLoader(manager);
        AUDIO_BUFFER

        LOAD_COUNT = 0;

        NORMAL_SOUND_PATHS = [
            // ITEM PICKUP
            { id: "wusch", url: "assets/sounds/wusch.ogg", volume: 0.5 },
            // ITEM SLOTS
            { id: "lightswitch", url: "assets/sounds/lightswitch.ogg", volume: 0.5 },
            { id: "harfe", url: "assets/sounds/harfe.ogg", volume: 0.5 },
            { id: "schlag", url: "assets/sounds/schlag.ogg", volume: 0.2 },
            // SAFE
            { id: "beep", url: "assets/sounds/beep.ogg", volume: 0.5 },
            // GUN
            { id: "railgun", url: "assets/sounds/railgun.ogg", volume: 0.1 },
            { id: "shellload", url: "assets/sounds/shell-load.ogg", volume: 0.2 },
            { id: "weaponclick", url: "assets/sounds/weaponclick.ogg", volume: 0.3 },
            { id: "sniperrifle", url: "assets/sounds/sniper.ogg", volume: 0.2 },
            { id: "sniperreload", url: "assets/sounds/reload.ogg", volume: 0.3 },
            { id: "cling", url: "assets/sounds/ding.ogg", volume: 0.3 },
            { id: "rifleshot", url: "assets/sounds/rifle_shot.wav", volume: 0.2 },
            { id: "g36reload", url: "assets/sounds/reload_sound.mp3", volume: 0.2 },
        ];

        POSITIONAL_BOW_PATHS = [{ id: "bow", url: "assets/sounds/bow.ogg", volume: 0.5, setRefDistance: 8 }];

        POSITIONAL_SAFE_PATHS = [
            { id: "safe_door", url: "assets/sounds/safe_door.ogg", volume: 0.1, setRefDistance: 8 },
            { id: "door", url: "assets/sounds/door.ogg", volume: 0.1, setRefDistance: 8 },
            { id: "quietsch2", url: "assets/sounds/quietsch2.ogg", volume: 0.5, setRefDistance: 8 },
            { id: "click_slow", url: "assets/sounds/click_slow.ogg", volume: 0.1, setRefDistance: 8 },
        ];

        POSITIONAL_SICHERUNGSKASTEN_PATHS = [
            { id: "schlag", url: "assets/sounds/schlag.ogg", volume: 0.1, setRefDistance: 8 },
            { id: "sicherung2", url: "assets/sounds/sicherung2.ogg", volume: 0.3, setRefDistance: 8 },
        ];

        this.sounds = {
            sounds: {},
            normal: {},
            positional: {
                bow: {},
                safe: {},
                sicherungskasten: {},
            },
        };

        NORMAL_SOUNDS_LENGTH = NORMAL_SOUND_PATHS.length;

        POSITIONALSOUNDSLENGTH =
            POSITIONAL_BOW_PATHS.length +
            POSITIONAL_SAFE_PATHS.length +
            POSITIONAL_SICHERUNGSKASTEN_PATHS.length;

        ALL_SOUNDS_LENGTH = NORMAL_SOUNDS_LENGTH + POSITIONALSOUNDSLENGTH;
    }

    loadSounds() {
        // normal sounds
        this.sounds.normal = this.loadAudio(NORMAL_SOUND_PATHS);
        // positional sounds
        this.sounds.positional.bow = this.loadPositionalAudio(
            POSITIONAL_BOW_PATHS,
            this.sounds.positional.bow,
            "bow"
        );
        this.sounds.positional.safe = this.loadPositionalAudio(
            POSITIONAL_SAFE_PATHS,
            this.sounds.positional.safe,
            "safe"
        );
        this.sounds.positional.sicherungskasten = this.loadPositionalAudio(
            POSITIONAL_SICHERUNGSKASTEN_PATHS,
            this.sounds.positional.sicherungskasten,
            "sicherungskasten"
        );

        return this.sounds;
    }

    checkPreloadSoundsCompletion(object, type) {
        LOAD_COUNT++;
        if (LOAD_COUNT === ALL_SOUNDS_LENGTH) {
            this.soundLoadCallback(this.sounds, 'sounds');
        }
    }

    loadAudio(manifest) {
        var soundReferences = {};
        let boss = this;
        var sounds_ref = {};

        manifest.forEach((item) => {
            var sound = new THREE.Audio(AUDIO_LISTENER);
            sound.name = item.id;
            sound.setVolume(item.volume);

            AUDIO_LOADER.load(item.url, function (object) {
                object.userData = {};
                object.userData.url = item.url;
                object.userData.id = item.id;
                object.userData.volume = item.volume;

                boss.sounds.normal[item.id] = object;
                boss.sounds.sounds[item.id] = object;


                boss.checkPreloadSoundsCompletion(object, "normal");
            });
        });

        return soundReferences;
    }

    loadPositionalAudio(manifest, parent, type) {
        var soundReferences = {};
        let boss = this;

        manifest.forEach((item) => {
            var sound = new THREE.PositionalAudio(AUDIO_LISTENER);
            sound.name = item.id;
            sound.setVolume(item.volume);
            sound.setRefDistance(item.setRefDistance);
            soundReferences[item.id] = sound;

            AUDIO_LOADER.load(item.url, function (object) {
                object.userData = {};
                object.userData.url = item.url;
                object.userData.id = item.id;
                object.userData.volume = item.volume;

                // this is just to keep sync with the old ways
                // this app has of accessing sounds in inconsistant ways
                // there's no point to sounds being in different objects
                // just access them by name in one sound containing object
                switch(type) {
                    case 'bow':
                        boss.sounds.positional.bow[item.id] = object;
                        break;
                    case 'safe':
                        boss.sounds.positional.safe[item.id] = object;
                        break;
                    case 'sicherungskasten':
                        boss.sounds.positional.sicherungskasten[item.id] = object;
                        break;
                    default:
                        console.log('No handler for sound type: ' + type);

                }

                boss.sounds.sounds[item.id] = object;

                parent[item.id] = object;

                boss.checkPreloadSoundsCompletion(object, "positional");
            });
        });

        return soundReferences;
    }
}
