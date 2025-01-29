// ALMOST_A_CLASS

var loadWeapons = loadedWeapons;

function initWeapons() {

    var shotgun = new Weapon(loadWeapons.shotgun);
    shotgun.name = "Shotgun";
    shotgun.maxCapacity = 8;
    shotgun.currentCapacity = 8;
    shotgun.magazines = 1;
    shotgun.shootDelay = 0.15;
    shotgun.shootSound = sounds.railgun;
    shotgun.reloadSound = sounds.shellload;
    shotgun.reloadTime = 0.3;
    shotgun.power = 20;
    shotgun.ironSightPosition = new THREE.Vector3(0.014, -0.03, shotgun.mesh.position.z + 0.15);

    var sniper = new Weapon(loadWeapons.sniper);
    sniper.name = "MK 14";
    sniper.maxCapacity = 6;
    sniper.currentCapacity = 6;
    sniper.magazines = 5;
    sniper.reloadTime = 4;
    sniper.shootDelay = 0.8;
    sniper.power = 100;
    sniper.shootSound = sounds.rifleshot;
    sniper.reloadSound = sounds.sniperreload;
    sniper.emptySound = sounds.cling;
    sniper.ironSightPosition = new THREE.Vector3(0.006, -0.125, sniper.mesh.position.z);
    sniper.ironSightRotation = new THREE.Vector3(0, (0.0 * Math.PI) / 180, 0);
    // weapons.add( sniper.mesh );

    var rifle = new Weapon(loadWeapons.rifle);
    rifle.name = "G36C";
    rifle.maxCapacity = 30;
    rifle.currentCapacity = 30;
    rifle.magazines = 2;
    rifle.reloadTime = 3.1;
    rifle.shootDelay = 0.1;
    rifle.power = 50;
    rifle.shootSound = sounds.rifleshot;
    rifle.reloadSound = sounds.g36reload;
    rifle.ironSightPosition = new THREE.Vector3(0.0, -0.27, rifle.mesh.position.z);
    // weapons.add( rifle.mesh );

    return {
        shotgun: shotgun,
        sniper: sniper,
        rifle: rifle,
    };
}
