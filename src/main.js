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

// =======================
// 创建场景
// =======================

const scene =
new THREE.Scene();


const loader =
new THREE.TextureLoader();

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

const composer =
new EffectComposer(renderer);


const renderPass =
new RenderPass(
scene,
camera
);


composer.addPass(
renderPass
);

const bloomPass =
new UnrealBloomPass(

new THREE.Vector2(

window.innerWidth,

window.innerHeight

),

0.15,

0.3,

0.9

);


composer.addPass(
bloomPass
);

renderer.toneMapping =
THREE.ACESFilmicToneMapping;


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

const starGeometry =
new THREE.BufferGeometry();


const starCount = 20000;


const starPositions=[];


for(
    let i=0;
    i<starCount;
    i++
){

    const x =
    (Math.random()-0.5)*3000;


    const y =
    (Math.random()-0.5)*3000;


    const z =
    (Math.random()-0.5)*3000;


    starPositions.push(
        x,
        y,
        z
    );

}



starGeometry.setAttribute(

    "position",

    new THREE.Float32BufferAttribute(

        starPositions,

        3

    )

);



const starMaterial =
new THREE.PointsMaterial({

    color:0xffffff,

    size:1.5

});



const stars =
new THREE.Points(

    starGeometry,

    starMaterial

);


scene.add(stars);



// =======================
// 太阳
// =======================


const sunGeometry =
new THREE.SphereGeometry(

    12,

    64,

    64

);


const sunMaterial =
new THREE.MeshBasicMaterial({

    map:
    loader.load(
        sunTexture
    ),

});


// =======================
// 太阳外层光晕
// =======================



const sun =
new THREE.Mesh(

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

    // 行星球体

    const geometry =
    new THREE.SphereGeometry(
        radius,
        64,
        64
    );

const material =
new THREE.MeshStandardMaterial({

color:0xffffff,

map:texture,

roughness:0.6,

metalness:0,

emissive:texture,

emissiveIntensity:0.15

});

    const planet =
    new THREE.Mesh(
        geometry,
        material
    );


    // 公转轨道组

    const orbit =
    new THREE.Group();


    scene.add(orbit);



    // 行星放到轨道半径位置

    planet.position.x =
    distance;


    orbit.add(planet);



    // 保存运动参数

    planet.userData = {

        orbitSpeed:
        orbitSpeed,

        rotationSpeed:
        rotationSpeed,

        orbitGroup:
        orbit

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

const geometry =
new THREE.SphereGeometry(
radius,
64,
64
);


const material =
new THREE.ShaderMaterial({

transparent:true,

side:THREE.BackSide,


uniforms:{

atmosphereColor:{
value:
new THREE.Color(color)
}

},


vertexShader:`

varying vec3 vNormal;


void main(){

vNormal =
normalize(
normalMatrix * normal
);


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

float intensity =
pow(
0.55 -
dot(
vNormal,
vec3(0.0,0.0,1.0)
),
3.0
);


gl_FragColor =
vec4(
atmosphereColor,
intensity
);

}

`

});


const atmosphere =
new THREE.Mesh(
geometry,
material
);


planet.add(
atmosphere
);


}

// =======================
// 木星程序纹理
// =======================

function createJupiterTexture(){

const canvas =
document.createElement("canvas");

canvas.width = 2048;
canvas.height = 1024;

const context =
canvas.getContext("2d");

const baseGradient =
context.createLinearGradient(
0,
0,
0,
canvas.height
);

baseGradient.addColorStop(0,"#e7d0aa");
baseGradient.addColorStop(0.18,"#b9794e");
baseGradient.addColorStop(0.34,"#efd8b4");
baseGradient.addColorStop(0.50,"#a7603f");
baseGradient.addColorStop(0.66,"#e6c59b");
baseGradient.addColorStop(0.82,"#b7744c");
baseGradient.addColorStop(1,"#ead1aa");

context.fillStyle =
baseGradient;

context.fillRect(
0,
0,
canvas.width,
canvas.height
);

const bandColors = [
"rgba(244,221,186,0.78)",
"rgba(154,91,58,0.64)",
"rgba(225,185,137,0.72)",
"rgba(119,68,49,0.50)",
"rgba(248,225,191,0.80)",
"rgba(184,112,72,0.58)",
"rgba(239,207,164,0.72)",
"rgba(142,80,56,0.54)",
"rgba(239,214,177,0.76)",
"rgba(177,106,69,0.56)",
"rgba(232,194,148,0.68)",
"rgba(133,76,55,0.48)",
"rgba(241,214,174,0.74)",
"rgba(185,116,75,0.54)",
"rgba(235,204,160,0.72)",
"rgba(151,87,60,0.50)"
];

const bandHeight =
canvas.height / bandColors.length;

bandColors.forEach(
(color,index)=>{

const centerY =
index * bandHeight + bandHeight * 0.5;

context.beginPath();

context.moveTo(
0,
centerY
);

for(
let x=0;
x<=canvas.width;
x+=16
){

const wave =
Math.sin(
x * 0.018 + index * 1.35
) * (6 + (index % 4) * 2)
+
Math.sin(
x * 0.006 + index * 0.7
) * 4;

context.lineTo(
x,
centerY + wave
);

}

context.strokeStyle = color;
context.lineWidth = bandHeight * 0.72;
context.lineCap = "round";
context.stroke();

}
);

for(
let i=0;
i<180;
i++
){

const y =
Math.random() * canvas.height;

const x =
Math.random() * canvas.width;

const length =
60 + Math.random() * 220;

context.beginPath();

context.moveTo(
x,
y
);

context.lineTo(
x + length,
y + (Math.random()-0.5) * 8
);

context.strokeStyle =
Math.random() > 0.5
? "rgba(255,235,205,0.16)"
: "rgba(104,59,45,0.15)";

context.lineWidth =
1 + Math.random() * 4;

context.stroke();

}

const spotGradient =
context.createRadialGradient(
1450,
650,
18,
1450,
650,
150
);

spotGradient.addColorStop(0,"rgba(215,117,79,0.98)");
spotGradient.addColorStop(0.45,"rgba(178,82,59,0.94)");
spotGradient.addColorStop(0.78,"rgba(198,107,76,0.78)");
spotGradient.addColorStop(1,"rgba(132,70,55,0.18)");

context.fillStyle =
spotGradient;

context.beginPath();

context.ellipse(
1450,
650,
155,
70,
-0.08,
0,
Math.PI * 2
);

context.fill();

context.strokeStyle =
"rgba(244,195,153,0.38)";

context.lineWidth = 10;

context.beginPath();

context.ellipse(
1450,
650,
185,
88,
-0.08,
0,
Math.PI * 2
);

context.stroke();

const texture =
new THREE.CanvasTexture(canvas);

texture.colorSpace =
THREE.SRGBColorSpace;

texture.anisotropy =
renderer.capabilities.getMaxAnisotropy();

return texture;

}

const jupiterTexture =
createJupiterTexture();
    

// =======================
// 地球
// =======================


const planetData = [

{
name:"Mercury",

radius:0.8,

distance:20,

color:0x888888,

orbitSpeed:0.01,

rotationSpeed:0.02,

texture:
loader.load(
mercuryTexture
)
},


{
name:"Venus",

radius:1.5,

distance:27,

color:0xd9a066,

orbitSpeed:0.006,

rotationSpeed:0.008,

texture:
loader.load(
venusTexture
)
},


{
name:"Earth",

radius:3,

distance:35,

color:0xffffff,

orbitSpeed:0.002,

rotationSpeed:0.01,

texture:
loader.load(
earthDay
)

},


{
name:"Mars",

radius:1.1,

distance:45,

color:0xaa5533,

orbitSpeed:0.008,

rotationSpeed:0.01,

texture:
loader.load(
marsTexture
)
},

{
name:"Jupiter",

radius:6.5,

distance:68,

color:0xd6a36f,

orbitSpeed:0.0007,

rotationSpeed:0.016,

texture:
jupiterTexture
}

];

const planets = [];

let earth;

planetData.forEach(
data=>{

const planet =
createPlanet(

data.radius,

data.distance,

data.color,

data.orbitSpeed,

data.rotationSpeed,

data.texture

);



planet.name =
data.name;


if(data.name === "Earth")
{

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



if(data.name === "Mars")
{

createAtmosphere(
planet,
1.14,
0xff6633
);

}

if(data.name === "Jupiter")
{

planet.rotation.z =
THREE.MathUtils.degToRad(3.1);

planet.material.roughness = 0.78;
planet.material.emissiveIntensity = 0.08;

}



planets.push(
planet
);


}
);


// =======================
// 创建行星轨道
// =======================

function createOrbit(radius){

    const geometry =
    new THREE.RingGeometry(
        radius - 0.02,
        radius + 0.02,
        256
    );


    const material =
    new THREE.MeshBasicMaterial({

        color:0x444444,

        side:THREE.DoubleSide,

        transparent:true,

        opacity:0.35

    });


    const orbit =
    new THREE.Mesh(
        geometry,
        material
    );


    orbit.rotation.x =
    Math.PI / 2;


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

createOrbit(68);



const cloudMaterial =
new THREE.MeshStandardMaterial({

map:
loader.load(earthClouds),

transparent:true,

opacity:0.45,

emissive:0xffffff,

emissiveIntensity:0.08

});


const clouds =
new THREE.Mesh(

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


const moonGeometry =
new THREE.SphereGeometry(

    0.5,

    32,

    32

);



const moonMaterial =
new THREE.MeshStandardMaterial({

    color:0xaaaaaa

});



const moon =
new THREE.Mesh(

    moonGeometry,

    moonMaterial

);


const moonOrbit =
new THREE.Group();


earth.add(moonOrbit);


moon.position.x = 6;


moonOrbit.add(moon);




// =======================
// 光照
// =======================


const light =
new THREE.PointLight(

    0xffffff,

    10,

    500

);


scene.add(light);




// 环境光

const ambient =
new THREE.AmbientLight(

    0xffffff,

    0.25

);


scene.add(ambient);



// =======================
// 动画
// =======================


function animate(){
    sun.rotation.y +=0.002;

    requestAnimationFrame(
        animate
    );
   
    
  planets.forEach(
planet=>{

    // 行星自转
    planet.rotation.y +=
    planet.userData.rotationSpeed;


    // 行星公转
    planet.userData.orbitGroup.rotation.y +=
    planet.userData.orbitSpeed;

}
);

    moonOrbit.rotation.y +=0.02;

   


    stars.rotation.y +=0.0002;


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