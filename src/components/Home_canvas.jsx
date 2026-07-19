import { useEffect, useRef, useContext } from 'react';
import * as THREE from 'three';
import { MainContext } from "./Home";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import PostProcessingMod from '../assets/js/postprocessing';
import TWEEN from 'tween';
import landscape from '../assets/images/1.jpeg';

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
  vec3 Pi0 = floor(P); 
  vec3 Pi1 = Pi0 + vec3(1.0); 
  Pi0 = mod(Pi0, 289.0);
  Pi1 = mod(Pi1, 289.0);
  vec3 Pf0 = fract(P); 
  vec3 Pf1 = Pf0 - vec3(1.0); 
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
  float noiseValue = abs(cnoise(vNormal * 4.5 + time * 2.0)); 
  float baseDeform = pow(noiseValue, 2.0);
  float noisy = clamp(mouse * baseDeform * 1.5, 0.0, 0.35); 
  vec3 newPosition = position + noisy * normal;
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
  const { openAboutme, openMyWork, openFirst, wireFrameOn } = useContext(MainContext);
  const containerRef = useRef(null);
  
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const icoRef = useRef(null);
  const icoLinesRef = useRef(null);
  const materialRef = useRef(null);
  const material1Ref = useRef(null);
  const orbitGroupRef = useRef(null); 

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    const camera = new THREE.PerspectiveCamera(95, window.innerWidth / window.innerHeight, 0.001, 1000);
    camera.position.set(0, 0, 2);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x111111, 1);
    containerRef.current.appendChild(renderer.domElement);

    let t = new THREE.TextureLoader().load(landscape);
    t.wraps = t.wrapT = THREE.MirroredRepeatWrapping;

    const material = new THREE.ShaderMaterial({
      extensions: { derivatives: "#extension GL_OES_standard_derivatives : enable" },
      side: THREE.DoubleSide,
      uniforms: { 
        time: { value: 0 }, mouse: { value: 0 }, landscape: { value: t },
        resolution: { value: new THREE.Vector4() }, uvRate1: { value: new THREE.Vector2(1, 1) } 
      },
      vertexShader, fragmentShader 
    });

    const material1 = new THREE.ShaderMaterial({
      extensions: { derivatives: "#extension GL_OES_standard_derivatives : enable" },
      side: THREE.DoubleSide,
      uniforms: { 
        time: { value: 0 }, mouse: { value: 0 }, landscape: { value: t },
        resolution: { value: new THREE.Vector4() }, uvRate1: { value: new THREE.Vector2(1, 1) } 
      },
      vertexShader, fragmentShader: fragmentShader1, wireframe: wireFrameOn 
    });

    materialRef.current = material;
    material1Ref.current = material1;

    let geometry1 = new THREE.IcosahedronGeometry(1.030, 2);
    let length = geometry1.attributes.position.array.length;
    let bary = [];
    for(let i = 0; i < length/3; i++) bary.push(0,0,1, 0,1,0, 1,0,0);
    geometry1.setAttribute('aBary', new THREE.BufferAttribute(new Float32Array(bary), 3));

    const ico = new THREE.Mesh(geometry1, material);
    const icoLines = new THREE.Mesh(geometry1, material1);
    scene.add(ico, icoLines);
    icoRef.current = ico;
    icoLinesRef.current = icoLines;

    const orbitGroup = new THREE.Group();
    scene.add(orbitGroup);
    orbitGroupRef.current = orbitGroup; 

    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.15 });
    const ringGeo = new THREE.TorusGeometry(1.5, 0.01, 4, 12);
    const ring1 = new THREE.Mesh(ringGeo, ringMaterial);
    ring1.rotation.y = Math.PI / 2;
    orbitGroup.add(ring1);
    const ring2 = new THREE.Mesh(ringGeo, ringMaterial);
    ring2.rotation.x = Math.PI / 2;
    orbitGroup.add(ring2);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const customPass = new ShaderPass(PostProcessingMod);
    customPass.uniforms["resolution"] = { value: new THREE.Vector2(window.innerWidth, window.innerHeight) };
    composer.addPass(customPass);

    let time = 0;
    let targetMouse = 0, currentMouse = 0, lastX = 0, lastY = 0;
    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      currentMouse += (targetMouse - currentMouse) * 0.05;
      targetMouse *= 0.9;
      time += 0.002;
      scene.rotation.x = time;
      scene.rotation.y = time;
      orbitGroup.rotation.y -= 0.005;
      orbitGroup.rotation.z -= 0.003;
      material.uniforms.time.value = time;
      material.uniforms.mouse.value = currentMouse * 0.5;
      material1.uniforms.time.value = time;
      material1.uniforms.mouse.value = currentMouse * 0.5;
      TWEEN.update();
      composer.render();
    };

    animate();

    const handleMouseMove = (e) => {
      let speed = Math.sqrt((e.pageX - lastX) ** 2 + (e.pageY - lastY) ** 2) * 0.1;
      targetMouse = Math.min(speed, 5);
      lastX = e.pageX; lastY = e.pageY;
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const { camera, ico, icoLines, material, material1, orbitGroup } = { 
        camera: cameraRef.current, ico: icoRef.current, icoLines: icoLinesRef.current, 
        material: materialRef.current, material1: material1Ref.current, orbitGroup: orbitGroupRef.current
    };
    
    if (!camera || !ico || !orbitGroup || !container) return;

    if (openAboutme) {
      container.style.setProperty('opacity', '1', 'important');
      container.style.pointerEvents = 'auto';

      material.wireframe = true;
      material1.wireframe = true;
      ico.visible = true;
      icoLines.visible = true;
      orbitGroup.visible = false;
      
      new TWEEN.Tween(ico.position).to({ x: -1 }, 1000).easing(TWEEN.Easing.Quadratic.Out).start();
      new TWEEN.Tween(icoLines.position).to({ x: -1 }, 1000).easing(TWEEN.Easing.Quadratic.Out).start();
      new TWEEN.Tween(camera.position).to({ z: 1 }, 1000).easing(TWEEN.Easing.Quadratic.Out).start();

    } else if (openMyWork) {
      container.style.setProperty('opacity', '0', 'important');
      container.style.pointerEvents = 'none';

      ico.visible = false;
      icoLines.visible = false;
      orbitGroup.visible = false; 

    } else if (openFirst) {
      container.style.setProperty('opacity', '1', 'important');
      container.style.pointerEvents = 'auto';

      material.wireframe = false;
      material1.wireframe = false;
      ico.visible = true;
      icoLines.visible = true;
      orbitGroup.visible = true;

      new TWEEN.Tween(ico.position).to({ x: 0 }, 1000).easing(TWEEN.Easing.Quadratic.Out).start();
      new TWEEN.Tween(icoLines.position).to({ x: 0 }, 1000).easing(TWEEN.Easing.Quadratic.Out).start();
      new TWEEN.Tween(camera.position).to({ z: 2 }, 1000).easing(TWEEN.Easing.Quadratic.Out).start();
    }
    
    material.needsUpdate = true;
    material1.needsUpdate = true;
  }, [openAboutme, openMyWork, openFirst]);

  return (
    <div 
      ref={containerRef} 
      className='home_container_cont' 
      style={{ transition: 'opacity 0.5s ease-in-out' }}
    ></div>
  );
}

export default HomeCanvas;