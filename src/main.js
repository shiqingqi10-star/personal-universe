import * as THREE from "three";

import { EffectComposer }
from "three/examples/jsm/postprocessing/EffectComposer.js";

import { RenderPass }
from "three/examples/jsm/postprocessing/RenderPass.js";

import { UnrealBloomPass }
from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

import sunTexture from "../textures/sun_real.jpg";

import { OrbitControls } from
"three/examples/jsm/controls/OrbitControls.js";

import earthDay from "../textures/earth_day.jpg";
import earthNormal from "../textures/earth_normal.jpg";
import earthNight from "../textures/earth_night.jpg";
import earthClouds from "../textures/earth_clouds.png";
import mercuryTexture from "../textures/mercury.jpg";
import venusTexture from "../textures/venus.jpg";
import marsTexture from "../textures/mars.jpg";
import jupiterTexture from "../textures/jupiter.jpg";
import saturnTexture from "../textures/saturn.jpg";

// =======================
// 创建场景
// =======================

const scene = new THREE.Scene();
const loader = new THREE.TextureLoader();

scene.background = new THREE.Color(0x000000);

// =======================
// 摄像机
// =======================

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    5000
);

camera.position.set(
    0,
    60,
    160
);

// =======================
// 渲染器
// =======================

const renderer = new THREE.WebGLRenderer({
    antialias:true
});

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(
    window.devicePixelRatio
);

document.body.appendChild(
    renderer.domElement
);

const composer = new EffectComposer(renderer);

const renderPass = new RenderPass(
    scene,
    camera
);

composer.addPass(renderPass);

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(
        window.innerWidth,
        window.innerHeight
    ),
    0.15,
    0.3,
    0.9
);

composer.addPass(bloomPass);

renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

// =======================
// 鼠标控制
// =======================

const controls = new OrbitControls(
    camera,
    renderer.domElement
);

controls.enableDamping = true;
controls.dampingFactor = 0.05;

// =======================
// 星空系统
// =======================

const starGeometry = new THREE.BufferGeometry();
const starCount = 20000;
const starPositions=[];

for(let i=0;i<starCount;i++){
    const x = (Math.random()-0.5)*3000;
    const y = (Math.random()-0.5)*3000;
    const z = (Math.random()-0.5)*3000;

    starPositions.push(x,y,z);
}

starGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
        starPositions,
        3
    )
);

const starMaterial = new THREE.PointsMaterial({
    color:0xffffff,
    size:1.5
});

const stars = new THREE.Points(
    starGeometry,
    starMaterial
);

scene.add(stars);

// =======================
// 太阳
// =======================

const sunGeometry = new THREE.SphereGeometry(
    12,
    64,
    64
);

const sunMaterial = new THREE.MeshBasicMaterial({
    map:loader.load(sunTexture)
});

const sun = new THREE.Mesh(
    sunGeometry,
    sunMaterial
);

scene.add(sun);

// =======================
// 行星创建系统
// =======================

function createPlanet(
    radius,
    distance,
    color,
    orbitSpeed,
    rotationSpeed,
    texture
){
    const geometry = new THREE.SphereGeometry(
        radius,
        64,
        64
    );

    const material = new THREE.MeshStandardMaterial({
        color:0xffffff,
        map:texture,
        roughness:0.6,
        metalness:0,
        emissive:texture,
        emissiveIntensity:0.15
    });

    const planet = new THREE.Mesh(
        geometry,
        material
    );

    const orbit = new THREE.Group();
    scene.add(orbit);

    planet.position.x = distance;
    orbit.add(planet);

    planet.userData = {
        orbitSpeed:orbitSpeed,
        rotationSpeed:rotationSpeed,
        orbitGroup:orbit
    };

    return planet;
}

// =======================
// 行星大气层
// =======================

function createAtmosphere(
    planet,
    radius,
    color
){
    const geometry = new THREE.SphereGeometry(
        radius,
        64,
        64
    );

    const material = new THREE.ShaderMaterial({
        transparent:true,
        side:THREE.BackSide,

        uniforms:{
            atmosphereColor:{
                value:new THREE.Color(color)
            }
        },

        vertexShader:`
            varying vec3 vNormal;

            void main(){
                vNormal = normalize(normalMatrix * normal);

                gl_Position =
                projectionMatrix *
                modelViewMatrix *
                vec4(position,1.0);
            }
        `,

        fragmentShader:`
            uniform vec3 atmosphereColor;
            varying vec3 vNormal;

            void main(){
                float intensity = pow(
                    0.55 - dot(
                        vNormal,
                        vec3(0.0,0.0,1.0)
                    ),
                    3.0
                );

                gl_FragColor = vec4(
                    atmosphereColor,
                    intensity
                );
            }
        `
    });

    const atmosphere = new THREE.Mesh(
        geometry,
        material
    );

    planet.add(atmosphere);
}

// =======================
// 木星与土星照片纹理
// =======================

const jupiterMap = loader.load(jupiterTexture);
jupiterMap.colorSpace = THREE.SRGBColorSpace;
jupiterMap.anisotropy = renderer.capabilities.getMaxAnisotropy();

const saturnMap = loader.load(saturnTexture);
saturnMap.colorSpace = THREE.SRGBColorSpace;
saturnMap.anisotropy = renderer.capabilities.getMaxAnisotropy();

// =======================
// 土星环系统
// =======================

function createSaturnRings(planet){
    const ringGroup = new THREE.Group();

    // 多层独立环带，比直接把一张方形图片贴到 RingGeometry 上更稳定，
    // 同时保留明显的卡西尼缝和不同明暗层次。
    const ringBands = [
        { inner:7.4, outer:8.1, color:0xc9b58e, opacity:0.34 },
        { inner:8.15, outer:9.15, color:0xe3d2ad, opacity:0.62 },
        { inner:9.2, outer:10.15, color:0xbca47f, opacity:0.48 },
        { inner:10.25, outer:10.65, color:0x786956, opacity:0.22 },
        // 卡西尼缝：10.65 到 11.0 故意留空
        { inner:11.0, outer:11.65, color:0xd8c7a4, opacity:0.52 },
        { inner:11.7, outer:12.55, color:0xb49e7c, opacity:0.38 },
        { inner:12.6, outer:13.35, color:0xe1d0ad, opacity:0.24 }
    ];

    ringBands.forEach((band,index)=>{
        const geometry = new THREE.RingGeometry(
            band.inner,
            band.outer,
            256
        );

        const material = new THREE.MeshBasicMaterial({
            color:band.color,
            side:THREE.DoubleSide,
            transparent:true,
            opacity:band.opacity,
            depthWrite:false,
            blending:THREE.NormalBlending
        });

        const ring = new THREE.Mesh(
            geometry,
            material
        );

        // RingGeometry 默认位于 XY 平面，转到土星赤道面。
        ring.rotation.x = Math.PI / 2;
        ring.renderOrder = 2 + index;

        ringGroup.add(ring);
    });

    // 让整个环组保持在土星赤道面，并跟随土星倾角与公转。
    planet.add(ringGroup);
    planet.userData.ringGroup = ringGroup;
}

// =======================
// 行星数据
// =======================

const planetData = [
    {
        name:"Mercury",
        radius:0.8,
        distance:20,
        color:0x888888,
        orbitSpeed:0.01,
        rotationSpeed:0.02,
        texture:loader.load(mercuryTexture)
    },
    {
        name:"Venus",
        radius:1.5,
        distance:27,
        color:0xd9a066,
        orbitSpeed:0.006,
        rotationSpeed:0.008,
        texture:loader.load(venusTexture)
    },
    {
        name:"Earth",
        radius:3,
        distance:35,
        color:0xffffff,
        orbitSpeed:0.002,
        rotationSpeed:0.01,
        texture:loader.load(earthDay)
    },
    {
        name:"Mars",
        radius:1.1,
        distance:45,
        color:0xaa5533,
        orbitSpeed:0.008,
        rotationSpeed:0.01,
        texture:loader.load(marsTexture)
    },
    {
        name:"Jupiter",
        radius:7.5,
        distance:62,
        color:0xffffff,
        orbitSpeed:0.0007,
        rotationSpeed:0.016,
        texture:jupiterMap
    },
    {
        name:"Saturn",
        radius:6.4,
        distance:86,
        color:0xffffff,
        orbitSpeed:0.00045,
        rotationSpeed:0.012,
        texture:saturnMap
    }
];

const planets = [];
let earth;

planetData.forEach(data=>{
    const planet = createPlanet(
        data.radius,
        data.distance,
        data.color,
        data.orbitSpeed,
        data.rotationSpeed,
        data.texture
    );

    planet.name = data.name;

    if(data.name === "Earth"){
        earth = planet;
        earth.material.emissiveIntensity = 0.3;

        createAtmosphere(
            earth,
            3.12,
            0x3399ff
        );

        createAtmosphere(
            earth,
            3.12,
            0x3399ff
        );
    }

    if(data.name === "Mars"){
        createAtmosphere(
            planet,
            1.14,
            0xff6633
        );
    }

    if(data.name === "Jupiter"){
        planet.rotation.z = THREE.MathUtils.degToRad(3.1);
        planet.material.map = jupiterMap;
        planet.material.roughness = 0.58;
        planet.material.emissive = new THREE.Color(0xffffff);
        planet.material.emissiveMap = jupiterMap;
        planet.material.emissiveIntensity = 0.22;
        planet.material.needsUpdate = true;
    }

    if(data.name === "Saturn"){
        // 土星轴倾角约 26.7°，球体与环一起倾斜。
        planet.rotation.z = THREE.MathUtils.degToRad(26.7);

        // 强化照片纹理本身，避免远离太阳后灰暗发黑。
        planet.material.map = saturnMap;
        planet.material.roughness = 0.62;
        planet.material.emissive = new THREE.Color(0xffffff);
        planet.material.emissiveMap = saturnMap;
        planet.material.emissiveIntensity = 0.25;
        planet.material.needsUpdate = true;

        createSaturnRings(planet);
    }

    planets.push(planet);
});

// =======================
// 创建行星轨道
// =======================

function createOrbit(radius){
    const geometry = new THREE.RingGeometry(
        radius - 0.02,
        radius + 0.02,
        256
    );

    const material = new THREE.MeshBasicMaterial({
        color:0x444444,
        side:THREE.DoubleSide,
        transparent:true,
        opacity:0.35
    });

    const orbit = new THREE.Mesh(
        geometry,
        material
    );

    orbit.rotation.x = Math.PI / 2;
    scene.add(orbit);

    return orbit;
}

// =======================
// 行星轨道
// =======================

createOrbit(20);
createOrbit(27);
createOrbit(35);
createOrbit(45);
createOrbit(62);
createOrbit(86);

// =======================
// 地球云层
// =======================

const cloudMaterial = new THREE.MeshStandardMaterial({
    map:loader.load(earthClouds),
    transparent:true,
    opacity:0.45,
    emissive:0xffffff,
    emissiveIntensity:0.08
});

const clouds = new THREE.Mesh(
    new THREE.SphereGeometry(
        3.05,
        64,
        64
    ),
    cloudMaterial
);

earth.add(clouds);

// =======================
// 月球
// =======================

const moonGeometry = new THREE.SphereGeometry(
    0.5,
    32,
    32
);

const moonMaterial = new THREE.MeshStandardMaterial({
    color:0xaaaaaa
});

const moon = new THREE.Mesh(
    moonGeometry,
    moonMaterial
);

const moonOrbit = new THREE.Group();
earth.add(moonOrbit);

moon.position.x = 6;
moonOrbit.add(moon);

// =======================
// 光照
// =======================

const light = new THREE.PointLight(
    0xffffff,
    10,
    500
);

scene.add(light);

const ambient = new THREE.AmbientLight(
    0xffffff,
    0.25
);

scene.add(ambient);

// =======================
// 动画
// =======================

function animate(){
    requestAnimationFrame(animate);

    sun.rotation.y += 0.002;

    planets.forEach(planet=>{
        // 所有行星自转，包括木星和土星
        planet.rotation.y +=
        planet.userData.rotationSpeed;

        // 所有行星公转，包括木星和土星
        planet.userData.orbitGroup.rotation.y +=
        planet.userData.orbitSpeed;
    });

    moonOrbit.rotation.y += 0.02;
    stars.rotation.y += 0.0002;

    controls.update();
    composer.render();
}

animate();

// =======================
// 窗口自适应
// =======================

window.addEventListener(
    "resize",
    ()=>{
        camera.aspect =
        window.innerWidth /
        window.innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );
    }
);