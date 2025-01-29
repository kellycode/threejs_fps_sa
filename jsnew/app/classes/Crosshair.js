// ALMOST_A_CLASS

class Crosshair {
    constructor(size, padding, camera) {
        var size = 0.003;
        var padding = 0.002;
    
        // MATERIAL
        var material = new THREE.LineBasicMaterial({
            color: 0x55ff55,
        });
    
        // GEOMETRY
        var geometry = new THREE.Geometry();
        var geometry2 = new THREE.Geometry();
        var geometry3 = new THREE.Geometry();
        var geometry4 = new THREE.Geometry();
    
        // open crosshair
        geometry.vertices.push(new THREE.Vector3(0, size + padding, 0));
        geometry.vertices.push(new THREE.Vector3(0, padding, 0));
    
        geometry2 = geometry.clone();
        geometry2.rotateZ(Math.PI);
    
        geometry3 = geometry.clone();
        geometry3.rotateZ(-Math.PI / 2);
    
        geometry4 = geometry.clone();
        geometry4.rotateZ(Math.PI / 2);
    
        var line = new THREE.Line(geometry, material);
        var line2 = new THREE.Line(geometry2, material);
        var line3 = new THREE.Line(geometry3, material);
        var line4 = new THREE.Line(geometry4, material);
    
        line.add(line2);
        line.add(line3);
        line.add(line4);
    
        // POSITION
        var crosshairPercentX = 50;
        var crosshairPercentY = 50;
        var crosshairPositionX = (crosshairPercentX / 100) * 2 - 1;
        var crosshairPositionY = (crosshairPercentY / 100) * 2 - 1;
        line.position.x = crosshairPositionX * camera.aspect;
        line.position.y = crosshairPositionY;
        line.position.z = -0.2;
    
        line.name = "crosshair";
    
        camera.add(line);
    
        return line;
    }
}
