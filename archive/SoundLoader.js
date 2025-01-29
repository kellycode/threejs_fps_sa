function callback(audioBuffer) {
    //this.setBuffer(audioBuffer);
    //console.log(audioBuffer)
}

function SoundLoader(listener, manager) {
    this.listener = listener;
    this.loader = new THREE.AudioLoader(manager);
}

SoundLoader.prototype.loadAudio = function (manifest) {
    var soundReferences = {};
    var sounds_ref = {};

    while (manifest.length > 0) {
        var item = manifest.shift();
        var sound = new THREE.Audio(this.listener);
        sound.name = item.id;
        sound.setVolume(item.volume);

        // UGLY GLOBAL FROM sounds.js
        sounds[ item.id ] = sounds_ref[ item.id ] = sound.load( item.url );
        sounds_ref[ item.id ].userData.url = item.url;
        sounds_ref[ item.id ].userData.audio = sound;

        this.loader.load(item.url, callback.bind(sound));
    }

    return soundReferences;
};

SoundLoader.prototype.loadPositionalAudio = function (manifest) {
    var soundReferences = {};

    while (manifest.length > 0) {
        var item = manifest.shift();
        var sound = new THREE.PositionalAudio(this.listener);
        sound.name = item.id;
        sound.setVolume(item.volume);
        sound.setRefDistance(item.setRefDistance);
        soundReferences[item.id] = sound;

        this.loader.onProgress = function (item, loaded, total) {
            console.log(item, loaded, total);
        };

        this.loader.load(item.url, callback.bind(sound));
    }

    return soundReferences;
};
