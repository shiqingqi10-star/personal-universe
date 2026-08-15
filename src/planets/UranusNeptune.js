import * as THREE from "three";

/**
 * Uranus and Neptune extension module
 * Used by personal-universe solar system.
 */

export function createIceGiant(
    scene,
    texture,
    options
){
    const geometry = new THREE.SphereGeometry(
        options.radius,
        64,
        64
    );

    const material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.65,
        metalness: 0,
        emissive: new THREE.Color(0xffffff),
        emissiveIntensity: options.emissiveIntensity || 0.15
    });

    const planet = new THREE.Mesh(
        geometry,
        material
    );

    const orbitGroup = new THREE.Group();
    scene.add(orbitGroup);

    planet.position.x = options.distance;
    orbitGroup.add(planet);

    planet.rotation.z = THREE.MathUtils.degToRad(
        options.axialTilt || 0
    );

    planet.userData = {
        name: options.name,
        orbitSpeed: options.orbitSpeed,
        rotationSpeed: options.rotationSpeed,
        orbitGroup
    };

    return planet;
}

export const iceGiantSettings = {
    Uranus:{
        name:"Uranus",
        radius:3.0,
        distance:110,
        axialTilt:97.8,
        orbitSpeed:0.00025,
        rotationSpeed:0.008,
        emissiveIntensity:0.18
    },
    Neptune:{
        name:"Neptune",
        radius:2.9,
        distance:135,
        axialTilt:28.3,
        orbitSpeed:0.00018,
        rotationSpeed:0.009,
        emissiveIntensity:0.25
    }
};
