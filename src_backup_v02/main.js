import * as THREE from "three";

import { EffectComposer } 
from "three/examples/jsm/postprocessing/EffectComposer.js";


import { RenderPass } 
from "three/examples/jsm/postprocessing/RenderPass.js";


import { UnrealBloomPass } 
from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

import sunTexture from "../textures/sun.jpg";

import { OrbitControls } from 
"three/examples/jsm/controls/OrbitControls.js";

import earthDay from "../textures/earth_day.jpg";

import earthNormal from "../textures/earth_normal.jpg";

import earthNight from "../textures/earth_night.jpg";

import earthClouds from "../textures/earth_clouds.png";

// =======================
// 创建场景
// =======================

const scene = new THREE.Scene();

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
    40,
    120
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

1.5,

0.4,

0.85

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
new THREE.ShaderMaterial({

uniforms:{


time:{
value:0
},


},

vertexShader:`

varying vec2 vUv;


void main(){

vUv=uv;


gl_Position=
projectionMatrix *
modelViewMatrix *
vec4(position,1.0);

}

`,


fragmentShader:`

uniform float time;

varying vec2 vUv;


void main(){


vec2 uv=vUv;


float wave=
sin(
uv.x*20.0+
time
)*0.05;


vec3 color=
vec3(
1.0,
0.45+wave,
0.05
);


gl_FragColor=
vec4(
color,
1.0
);


}

`

});



const sun =
new THREE.Mesh(

    sunGeometry,

    sunMaterial

);


scene.add(sun);

// =======================
// 太阳外层光晕
// =======================

const sunGlow = new THREE.Mesh(

    new THREE.SphereGeometry(
        14,
        64,
        64
    ),

    new THREE.MeshBasicMaterial({

        color: 0xff8a00,

        transparent: true,

        opacity: 0.12,

        blending: THREE.AdditiveBlending,

        side: THREE.BackSide,

        depthWrite: false

    })

);

scene.add(sunGlow);

const sunCorona = new THREE.Mesh(

    new THREE.SphereGeometry(
        17,
        64,
        64
    ),

    new THREE.MeshBasicMaterial({

        color: 0xffcc55,

        transparent: true,

        opacity: 0.04,

        blending: THREE.AdditiveBlending,

        side: THREE.BackSide,

        depthWrite: false

    })

);

scene.add(sunCorona);


// =======================
// 地球
// =======================


const earthGeometry =
new THREE.SphereGeometry(

    3,

    64,

    64

);


const loader =
new THREE.TextureLoader();


const earthMaterial =
new THREE.MeshStandardMaterial({

map:

loader.load(
earthDay
),


normalMap:

loader.load(
earthNormal
),


roughness:0.85,


metalness:0.1

});


const earth =
new THREE.Mesh(

    earthGeometry,

    earthMaterial

);



earth.position.x = 35;


scene.add(earth);
const cloudMaterial =
new THREE.MeshStandardMaterial({

map:
loader.load(earthClouds),

transparent:true,

opacity:0.35

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

    0.8,

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


scene.add(moon);



// =======================
// 光照
// =======================


const light =
new THREE.PointLight(

    0xffffff,

    3,

    500

);


scene.add(light);




// 环境光

const ambient =
new THREE.AmbientLight(

    0xffffff,

    0.2

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
    sunMaterial.uniforms.time.value += 0.02;

    earth.rotation.y +=0.01;


    moon.position.x =
    earth.position.x +
    Math.cos(Date.now()*0.001)*6;


    moon.position.z =
    Math.sin(Date.now()*0.001)*6;



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