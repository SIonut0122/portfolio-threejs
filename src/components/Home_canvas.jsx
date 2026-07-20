import { useEffect, useRef, useContext } from 'react';
import * as THREE from 'three';
import { MainContext } from "./Home";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import PostProcessingMod from '../assets/js/postprocessing';
import TWEEN from 'tween';
import landscape from '../assets/images/1.jpeg';
import { vertexShader, fragmentShader, fragmentShader1 } from '../assets/shaders/homeShaders'

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

      scene.rotation.x = time * 0.3;
      scene.rotation.y = time * 0.3;

      orbitGroup.rotation.y -= 0.0015;
      orbitGroup.rotation.z -= 0.001;

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

    // Folosim requestAnimationFrame pentru a lăsa DOM-ul să se randeze și să declanșeze tranziția CSS de fade-in
    requestAnimationFrame(() => {
      container.style.opacity = '1';
    });
    container.style.pointerEvents = openMyWork ? 'none' : 'auto';

    if (openAboutme) {
      material.wireframe = true;
      material1.wireframe = true;
      ico.visible = true;
      icoLines.visible = true;
      orbitGroup.visible = false;
      
      new TWEEN.Tween(ico.position).to({ x: -1 }, 500).easing(TWEEN.Easing.Quadratic.Out).start();
      new TWEEN.Tween(icoLines.position).to({ x: -1 }, 500).easing(TWEEN.Easing.Quadratic.Out).start();
      new TWEEN.Tween(camera.position).to({ z: 1 }, 500).easing(TWEEN.Easing.Quadratic.Out).start();

    } else if (openMyWork) {
      ico.visible = false;
      icoLines.visible = false;
      orbitGroup.visible = false; 

    } else if (openFirst) {
      material.wireframe = false;
      material1.wireframe = false;
      ico.visible = true;
      icoLines.visible = true;
      orbitGroup.visible = true;

      new TWEEN.Tween(ico.position).to({ x: 0 }, 500).easing(TWEEN.Easing.Quadratic.Out).start();
      new TWEEN.Tween(icoLines.position).to({ x: 0 }, 500).easing(TWEEN.Easing.Quadratic.Out).start();
      new TWEEN.Tween(camera.position).to({ z: 2 }, 500).easing(TWEEN.Easing.Quadratic.Out).start();
    }
    
    material.needsUpdate = true;
    material1.needsUpdate = true;
  }, [openAboutme, openMyWork, openFirst]);

  return (
    <div 
      ref={containerRef} 
      className='home_container_cont'
    ></div>
  );
}

export default HomeCanvas;