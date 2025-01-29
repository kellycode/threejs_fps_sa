let T_LOADED = false;
let M_LOADED = false;
let MAPPED_TEXTURES = {};
let MAPPED_MODELS = {};
let M_PRELOADS = [];

// Note: I set the loaders up to use promises but the
// old OBJLoader seemed to break the response, idk,
// so rolled my own check that compares the number
// requested to the number received.  Models need to be
// upgraded to gltf anyway so will update this then


class PreloadManager {
    
    constructor(preloadCallback) {
        this.preloadCallback = preloadCallback;
        this.PRELOADED = {};
    }

    M_PRELOADS = [
        "assets/models/ithaca/m37_tris.obj",
        "assets/models/mk14/mk14_2.obj",
        "assets/models/g36c/g36c_arby26.obj",
    ];

    // textures
    T_PRELOADS = [
        "assets/models/ithaca/M37_diffuse.jpg",
        "assets/models/ithaca/M37_normal.jpg",
        "assets/models/ithaca/Shells_diffuse.jpg",
        "assets/models/ithaca/Shells_normal.jpg",
        "assets/models/ithaca/M37_specular.jpg",
        "assets/models/mk14/MK14.jpg",
        "assets/models/mk14/MK14_normalprot.jpg",
        "assets/models/mk14/MK14_specular.jpg",
        "assets/models/g36c/mat/g36c_d_fin.jpg",
        "assets/models/g36c/mat/g36c_n_fin.jpg",
        "assets/models/g36c/mat/g36c_spec.jpg",
        "assets/models/g36c/mat/basic/g36c_bake_ao.png",
        "assets/models/g36c/mat/basic/g36c_bake_general_light_fine.png",
    ];


    preloadModels() {
        let objLoader = new THREE.OBJLoader(g_loadingManager);
        let modelPromises = [];
        let mappedModels = MAPPED_MODELS;
        let preloadsArray = this.M_PRELOADS;
        let boss = this;

        preloadsArray.forEach((modelName) => {
            modelPromises.push(
                objLoader.load(modelName, function (object) {
                    mappedModels[modelName] = object;
                    boss.#checkPreloadModelsCompletion(mappedModels, preloadsArray, boss);
                })
            );
        });
    }

    #checkPreloadModelsCompletion(object, preloads, boss) {
        // compare the length and probably should
        // make sure nothing is undefined but don't
        if (Object.keys(object).length === preloads.length) {
            console.log("All models are loaded");
            this.#checkAllLoaded(object, "models", this);
        }
    }

    preloadTextures() {
        let textureLoader = new THREE.TextureLoader(g_loadingManager);
        let texturePromises = [];
        let mappedTextures = MAPPED_TEXTURES;
        let preloadsArray = this.T_PRELOADS;
        let boss = this;

        preloadsArray.forEach((textureName) => {
            texturePromises.push(
                textureLoader.load(textureName, function (object) {
                    mappedTextures[textureName] = object;
                    boss.#checkPreloadTexturesCompletion(mappedTextures, preloadsArray, boss);
                })
            );
        });
    }

    #checkPreloadTexturesCompletion(object, preloads, boss) {
        // compare the length and probably should
        // make sure nothing is undefined but don't
        if (Object.keys(object).length === preloads.length) {
            console.log("All textures are loaded");
            this.#checkAllLoaded(object, "textures", this);
        }
    }

    #checkAllLoaded(object, name) {
        if (name === "models") {
            this.PRELOADED.models = object;
            M_LOADED = true;
        } else if (name === "textures") {
            this.PRELOADED.textures = object;
            T_LOADED = true;
        }

        if (T_LOADED && M_LOADED) {
            console.log("ALL IN");
            this.preloadCallback(this.PRELOADED, 'models');
        }
    }
}
