import { useEffect, useState, useContext, useRef } from 'react';
import * as THREE from 'three';
import { MainContext} from "./Home";
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass.js';
import PostProcessingMod from '../assets/js/postprocessing';
import * as dat from 'lil-gui';
import gsap from 'gsap';
import landscape from '../assets/images/1.jpeg';
import TWEEN from 'tween';
 
 


const fragmentShader = `
uniform float time;
uniform float progress;
uniform sampler2D landscape;
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 eyeVector;
varying vec3 vBary;
float PI = 3.141592653589793238;

vec2 hash22(vec2 p) {
  p = fract(p * vec2(5.3983, 5.4427));
  p += dot(p.yx, p.xy + vec2(21.5351, 14.3137));
  return fract(vec2(p.x * p.y * 95.4337, p.x * p.y * 97.597));
}

void main() {
  vec3 X = dFdx(vNormal);
  vec3 Y = dFdy(vNormal);
  vec3 normal = normalize(cross(X, Y));
  float diffuse = dot(normal, vec3(0.0, 0.0, 0.5));
  vec2 rand = hash22(vec2(floor(diffuse *20.)));
  vec2 uvv = vec2(
    sign(rand.x - 0.5)*1. + (rand.x - 0.5)*.6,
    sign(rand.y - 0.5)*1. + (rand.y - 0.5)*.6
  );

  float fresnel = abs(1. +dot(eyeVector, normal));

  vec2 uv = uvv*gl_FragCoord.xy / vec2(1000.);

  vec3 refracted = refract(eyeVector,normal,1./3.);
  uv += 0.2*refracted.xy;

  vec4 texColor = texture2D(landscape, uv);
  vec4 finalColor = texColor * vec4(diffuse);

  gl_FragColor = mix(finalColor, vec4(0.0, 0.0, 0.0, 1.0), 1.0 - fresnel);

 
}
`;



const vertexShader = `  
uniform float time;
uniform float mouse;
varying vec2 vUv;
varying vec3 vPosition;
uniform vec2 pixels;
varying vec3 vNormal;
varying vec3 eyeVector;
varying vec3 vBary;
attribute vec3 aBary;
float PI = 3.141592653589793238;

vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

float cnoise(vec3 P){
  vec3 Pi0 = floor(P); // Integer part for indexing
  vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
  Pi0 = mod(Pi0, 289.0);
  Pi1 = mod(Pi1, 289.0);
  vec3 Pf0 = fract(P); // Fractional part for interpolation
  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);

  vec4 gx0 = ixy0 / 7.0;
  vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 / 7.0;
  vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
  return 2.2 * n_xyz;
}

void main() {
  vUv = uv;
  vBary = aBary;
  vNormal = normalize(normalMatrix * normal);
  
  float smoothing = 0.99;
  float noisy = mouse * pow(cnoise(vNormal + time), 3.0) * smoothing;
  
  vec3 newPosition = mix(position, position + noisy * normal, smoothing);
  
  vec4 worldPosition = modelMatrix * vec4(newPosition, 1.0);
  eyeVector = normalize(worldPosition.xyz - cameraPosition);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
`;

const fragmentShader1 = `
uniform float time;
uniform float progress;
uniform sampler2D landscape;
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 eyeVector;
varying vec3 vBary;
float PI = 3.141592653589793238;

vec2 hash22(vec2 p) {
  p = fract(p * vec2(5.3983, 5.4427));
  p += dot(p.yx, p.xy + vec2(21.5351, 14.3137));
  return fract(vec2(p.x * p.y * 95.4337, p.x * p.y * 97.597));
}

void main() {
  float width = 1.;
  vec3 d = fwidth(vBary);
  vec3 s = smoothstep( d*(width + 0.5), d*(width - 0.5), vBary);
  float line = max(s.x, max(s.y,s.z));
  if(line<0.1) discard;
  gl_FragColor = vec4(mix(vec3(1.), vec3(0.), 1. - line),1.);
}
`;




function HomeCanvas() {
  const [rendered, setRendered] = useState(false);
  const [ canvasIsVisible, setCanvasIsVisible ] = useState(true);
  const { wireFrameOn, setWireFrameOn } = useContext(MainContext);
  const {openAboutme, setOpenAboutme} = useContext(MainContext);
  const {openMyWork, setOpenMyWork} = useContext(MainContext);
  const [aboutMeIsOpened, setAboutMeIsOpened] = useState(false);
  const {openFirst, setOpenFirst} = useContext(MainContext);
  
let material;
let material1;

let geometry;
let geometry1;
let ico;
let icoLines;
let renderer;
let scene;
let camera;
let composer;

  useEffect(() => {
    if (!rendered) {
      setRendered(true);
      
      scene = new THREE.Scene();
      let container = document.querySelector('.home_container_cont');

      camera = new THREE.PerspectiveCamera(95, window.innerWidth / window.innerHeight, 0.001, 1000);
      camera.position.set(0, 0, 2);

      renderer = new THREE.WebGLRenderer();
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x111111,1);
      renderer.physicallyCorrectLights = true;
      renderer.outputEncoding = THREE.sRGBEncoding;
      container.appendChild(renderer.domElement);

      // const controls = new OrbitControls(camera,renderer.domElement);
      let time = 0;
      let mouse = 0;

      let t = new THREE.TextureLoader().load(landscape);
      t.wraps = t.wrapT = THREE.MirroredRepeatWrapping;

       material = new THREE.ShaderMaterial({
        extensions: {
          derivatives: "#extension GL_OES_standard_derivatives : enable"
        },
        side: THREE.DoubleSide,
        uniforms: {
          time: { type: "f", value: 0},
          mouse: { type: "f" , value: 0},
          landscape: { value: t},
          resolution: { type: "v4", value: new THREE.Vector4()},
          uvRate1: {
            value: new THREE.Vector2(1, 1)
          }
        },
        vertexShader,
        fragmentShader, 
        // wireframe: wireFrameOn, 
      });


      material1 = new THREE.ShaderMaterial({
        extensions: {
          derivatives: "#extension GL_OES_standard_derivatives : enable"
        },
        side: THREE.DoubleSide,
        uniforms: {
          time: { type: "f", value: 0},
          mouse: { type: "f" , value: 0},
          landscape: { value: t},
          resolution: { type: "v4", value: new THREE.Vector4()},
          uvRate1: {
            value: new THREE.Vector2(1, 1)
          }
        },
        vertexShader,
        fragmentShader: fragmentShader1, 
        wireframe: wireFrameOn, 
      });
      
      
      geometry = new THREE.IcosahedronGeometry(1,2);
      geometry1 = new THREE.IcosahedronGeometry(1.030,2);
      let length = geometry1.attributes.position.array.length;
    
      let bary = [];

      for(let i = 0; i < length/3; i++) {
        bary.push(0,0,1, 0,1,0, 1,0,0);
      }
      let aBary = new Float32Array(bary);
      geometry1.setAttribute('aBary', new THREE.BufferAttribute(aBary, 3),);

      ico = new THREE.Mesh(geometry1, material);
      icoLines = new THREE.Mesh(geometry1, material1);
      scene.add(ico);
      scene.add(icoLines);

      ico.visible = canvasIsVisible;
      icoLines.visible = canvasIsVisible;
      
 

      composer = new EffectComposer( renderer );
      let customPass = new ShaderPass( PostProcessingMod );

        composer.addPass( new RenderPass(scene, camera));
        customPass.uniforms[ "resolution" ].value = new THREE.Vector2( window.innerWidth, window.innerHeight );
        customPass.uniforms[ "resolution" ].value.multiplyScalar(~ window.devicePixelRatio );
 
        composer.addPass( customPass );

  
 
      let settings = {
        howmuchrgbshifticanhaz: 1,
      }
      const initSettings = () => {
        gui.add(settings, "howmuchrgbshifticanhaz", 0,1,0.01);

      }

      let lastX = 0;
      let lastY = 0;
      let speed = 0;
      let mouseX
      let mouseY;
      let noiseIntensity = 0.0;


const mouseEvent = () => {
  document.addEventListener('mousemove', (e) => {
    speed = Math.sqrt((e.pageX - lastX) ** 2 + (e.pageY - lastY) ** 2) * 0.1;
    lastX = e.pageX;
    lastY = e.pageY;

    mouseX = e.clientX / window.innerWidth * 2 - 1; 
    mouseY = e.clientY / window.innerHeight * 2 - 1;
    
    camera.position.x = mouseX * 0.03;
    camera.position.y = -mouseY * 0.03;

    noiseIntensity = Math.max(0, Math.min(1, mouseX * mouseY * 2));
  });
}

    
 

      const animate = () => {
        requestAnimationFrame(animate);
        time += 0.002;
        mouse -=(mouse - speed)*0.25;
        speed *=0.35;
        scene.rotation.x = time;
        scene.rotation.y = time;

        customPass.uniforms.time.value = time;
        customPass.uniforms.howmuchrgbshifticanhaz.value = mouse/25;

        let noiseIntensity = 0.5;
        noiseIntensity = Math.max(0, Math.min(2, noiseIntensity));

        material.uniforms.time.value = time;
        material.uniforms.mouse.value = mouse * noiseIntensity;

        material1.uniforms.time.value = time;
        material1.uniforms.mouse.value = mouse  * noiseIntensity;
 
        TWEEN.update();
        composer.render();
      };

  
  
      const resize = () => {
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;
        camera.aspect = newWidth / newHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(newWidth, newHeight);
        composer.setSize(newWidth, newHeight);
      }

          
      window.addEventListener('resize', () => {
        resize();
      });

      animate();
      resize();
      // initSettings();
      mouseEvent();

      setTimeout(() => {
        if( document.querySelector('.home_container_cont')) {
        document.querySelector('.home_container_cont').setAttribute('style','opacity:1');
        }
      },200);

    }
 

  }, []);

const initialClearColor = new THREE.Color(0x111111);
const finalClearColor = new THREE.Color(0xffffff);
const clearColor = { r: initialClearColor.r, g: initialClearColor.g, b: initialClearColor.b };

const tween = new TWEEN.Tween(clearColor)
  .to({ r: finalClearColor.r, g: finalClearColor.g, b: finalClearColor.b }, 1000)
  .onUpdate(function () {
    renderer.setClearColor(new THREE.Color(clearColor.r, clearColor.g, clearColor.b), 1);
  });

  useEffect(() => {
    
    document.querySelector('.headernavwrp-home').classList.remove('d-none');
    document.querySelector('.headernavwrp-mywork').classList.add('d-none');

    document.querySelector('#whitefireframe').addEventListener('click', whiteBgWireframe);
    document.querySelectorAll('.header-nav-aboutme').forEach(el => el.addEventListener('click', openAboutMeComp));
    document.querySelectorAll('.header-nav-home').forEach(el => el.addEventListener('click', backToHome));
    document.querySelectorAll('.header-nav-mywork').forEach(el => el.addEventListener('click', openMyWorkComp));
  
  },[])
  
  let canvasDOM = document.querySelector('.home_container_cont');
  
  const whiteBgWireframe = () => {
  if (material && material1) {
    material.wireframe = true;
    material1.wireframe = true;

    material.needsUpdate = true;
    material1.needsUpdate = true;
    
    const whiteColor = new THREE.Color(0xffffff);
    tween.to({ r: whiteColor.r, g: whiteColor.g, b: whiteColor.b }, 1000).start();
  }
}
 
 

const aboutMeContainer = document.querySelector('.aboutme_container'); 
 
const openAboutMeComp = () => {
  
  // hide mobile menu if exists
  document.querySelector('.mobile-menu-cont').classList.remove('mobilemenu-active');
  document.querySelector('.hamburger').classList.remove('isactive');
  document.querySelector('body').classList.remove('fixed-body');

  if (!openAboutme && !document.querySelector('.aboutme_container')) {


 

    // hide containers
    document.querySelector('.home_container_cont').style.opacity = '0';
    if(document.querySelector('.first_container')) {
      document.querySelector('.first_container').style.opacity = '0';
    }
    if(document.querySelector('.mywork_container')) {
      document.querySelector('.mywork_container').style.opacity = '0';
    }
    
     // hide home nav menu
    document.querySelector('.headernavwrp-mywork').style.opacity = '0';
    document.querySelector('.headernavwrp-home').style.opacity = '0';
    // disable both
    document.querySelector('.headernavwrp-mywork').classList.add('disabled-nav');
    document.querySelector('.headernavwrp-home').classList.add('disabled-nav');
    document.querySelector('.headernavwrp-aboutme').classList.add('disabled-nav');

    setTimeout(() => {
      document.querySelector('.headernavwrp-home').classList.add('d-none');
      document.querySelector('.headernavwrp-mywork').classList.add('d-none');
    }, 1200);

   
      if (material && material1) {
        setTimeout(() => {

          setOpenMyWork(false);
          setOpenFirst(false);
          setOpenAboutme(true);

              material.wireframe = true;
              material1.wireframe = true;
      
              ico.position.x -= 1;
              icoLines.position.x -= 1;
              ico.visible = true;
              icoLines.visible = true;
              camera.position.set(0, 0, 1);
              camera.needsUpdate = true;
      
              material.needsUpdate = true;
              material1.needsUpdate = true;
      
            const blackColor = new THREE.Color(0x111111);
            tween.to({ r: blackColor.r, g: blackColor.g, b: blackColor.b }, 1000).start();


            setTimeout(() => {
              document.querySelector('.home_container_cont').setAttribute('style', 'opacity: 1');
            }, 500);
    
    }, 1500);

      }
  }
}


const openMyWorkComp = () => {

  // hide mobile menu if exists
  document.querySelector('.mobile-menu-cont').classList.remove('mobilemenu-active');
  document.querySelector('.hamburger').classList.remove('isactive');

  // hide object on 'mywork' page
  document.querySelector('.home_container_cont').style.opacity = '0';
  if( document.querySelector('.first_container')) {
    document.querySelector('.first_container').style.opacity = '0';
  }

  if(document.querySelector('.aboutme_container')) { 
    document.querySelector('.aboutme_container').style.opacity = '0';
    document.querySelector('.aboutme_section_one').style.opacity = '0'; 
  }

  // hide home nav menu
  document.querySelector('.headernavwrp-home').style.opacity = '0';
  document.querySelector('.headernavwrp-home').classList.add('disabled-nav');
  document.querySelector('.headernavwrp-mywork').classList.add('disabled-nav');
  
  setTimeout(() => {
    document.querySelector('.headernavwrp-home').classList.add('d-none');
  }, 1200);
 

  setTimeout(() => {
    setOpenAboutme(false);
    setOpenFirst(false);
    setOpenMyWork(true);

     if (material && material1) {
       camera.position.set(0, 0, 2);
       ico.position.x = 0;
       icoLines.position.x = 0;
       ico.visible = false;
       icoLines.visible = false;
       material.needsUpdate = true;
       material1.needsUpdate = true;
     }
     document.querySelector('.home_container_cont').style.opacity = '1'; 
  
  }, 1500);
}

const backToHome = () => {

      // hide mobile menu if exists
      document.querySelector('.mobile-menu-cont').classList.remove('mobilemenu-active');
      document.querySelector('.hamburger').classList.remove('isactive');

  if(!document.querySelector('.first_container')) {

    // disable nav
    document.querySelector('.headernavwrp-aboutme').classList.add('disabled-nav');
    // hide them
    document.querySelector('.headernavwrp-aboutme').style.opacity = '0';
    document.querySelector('.headernavwrp-mywork').style.opacity = '0';
    document.querySelector('.home_container_cont').style.opacity = '0';

    if(document.querySelector('.aboutme_container')) {
      document.querySelector('.aboutme_container').style.opacity = '0';
    }
    // after 1.2sec , hide them
    setTimeout(() => {
      document.querySelector('.headernavwrp-aboutme').classList.add('d-none');
      document.querySelector('.headernavwrp-mywork').classList.add('d-none');
    }, 1200);

    if(document.querySelector('.mywork_container')) {
      document.querySelector('.mywork_container').style.opacity = '0'; 
    }


    setTimeout(() => {
    
      setOpenMyWork(false);
    setOpenAboutme(false);
    setOpenFirst(true);
  

    if (material && material1) {
      material.wireframe = false;
      material1.wireframe = false;
      ico.visible = true;
      icoLines.visible = true;
      ico.position.x = 0;
      icoLines.position.x = 0;
      material.needsUpdate = true;
      material1.needsUpdate = true;
      camera.position.set(0, 0, 2);
    }

      setTimeout(() => {
        document.querySelector('.home_container_cont').style.opacity = '1'; 
      }, 500);
      setTimeout(() => {
        document.querySelector('.first_container').style.opacity = '1'; 
      }, 1200);
    
    }, 1500);

  }
}

  return (
    <>

        <div className='home_container_cont'>
        </div>
    </>
  );
}

export default HomeCanvas;
