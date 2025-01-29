/**
 * Setup the renderer
 */


var screen_width = window.innerWidth;
var screen_height = window.innerHeight;

// RENDERER
g_renderer = new THREE.WebGLRenderer({ antialias: true });
g_renderer.setSize(screen_width, screen_height);

g_renderer.shadowMap.enabled = true;
g_renderer.shadowMap.type = THREE.PCFSoftShadowMap;
g_renderer.autoClear = false;

// containerjs_container
g_scene_container.appendChild(g_renderer.domElement);
