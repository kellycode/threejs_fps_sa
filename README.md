# threejs-fps

KellyCode Jan 29, 2025  
Removed the require dependency, made eveything vanilla js and class  
Original fork: https://github.com/kellycode/threejs_fps_fork  

---

This is my prototype for a First Person Game.

![demoscene](/ogimage.jpg)

##Libraries used:
- [Three.js](https://github.com/mrdoob/three.js/)
- [Goblin Physics](https://github.com/chandlerprall/GoblinPhysics)
- [ShaderParticleEngine](https://github.com/squarefeet/ShaderParticleEngine)
- [JS FSM](https://github.com/jakesgordon/javascript-state-machine)
- [RequireJS](https://github.com/requirejs/requirejs)

##Game Features:
- First+Third Person Character Controller
- Player Weapons
- Collectable Items
- Simple HTML HUD
- Preloader

##Demo
The demo is also the current development branch, so what you will see may not be representative.
###[Run demo](https://weiserhei.github.io/threejs-fps/)

##ToDo
- Test replacing goblin for cannon.js
- Weapon recoil and feedback (http://csgoskills.com/academy/spray-patterns/)
- Automatic weapon fire
- Weapon onHit particle effects based on surface
- Add footsteps sound (https://github.com/makc/fps-three.js/commit/e18fe6aee92650e03e8dc45bb35d882c525ea1dc)
- Add Doors
- Add Jukebox
- Add moonphysics switch
- HUD (Classes, Styles)
- HUD Mode for Debugging
- Add Radar/Minimap
- Improve Character controller (Jumps, slopes)
- Add some simple Enemy characters (AI, Pathfinding, Animations)
- Add Octree Raycasting (performance improvement)
- Add Gamestate (Menu, Pausemenu)
- Release Pointer in Fullscreen and control Objects

##Resources
- https://makc3d.wordpress.com/2014/07/20/threejs-first-person-shooter/
- http://realitymeltdown.com/
- http://gamebanana.com
- http://freesound.org/
- http://tf3dm.com/
- http://codepen.io/edankwan/pen/OPewjz
