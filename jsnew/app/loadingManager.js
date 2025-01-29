// BASIC_SCENE_SETUP_ITEM

var g_loadingManager = new THREE.LoadingManager();

g_loadingManager.onProgress = function (item, loaded, total) {
    //console.log( item, loaded, total );
    //console.log(item)
    //console.log(loaded + ' ; ' + total)
    if(loadingScreen !== undefined) {
        loadingScreen.setProgress(loaded, total);
    } else {
        console.log("loadingScreen is undefined")
    }
};

g_loadingManager.onError = function (url) {
    console.warn("Loading Error", url);
};
