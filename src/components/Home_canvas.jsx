import { useEffect, useRef, useContext, useState } from 'react';
import * as THREE from 'three';
import { MainContext } from "./Home";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import PostProcessingMod from '../assets/js/postprocessing';
import TWEEN from 'tween';
import landscape from '../assets/images/1.jpeg';
import NebulaCursor from '../components/NebulaCursor';
import { vertexShader, fragmentShader, fragmentShader1 } from '../assets/shaders/homeShaders';
import { 
  playCoreTransitionSound, 
  playWindNebulaSound, 
  stopWindNebulaSound, 
  playMaterializeSound, 
  playDangerSound, 
  updateDangerVolume, 
  stopDangerSound,
  playExplosionSound,
  playCoolingDownSound
} from '../utils/soundUtils';

function HomeCanvas() {
  const { openAboutme, openMyWork, openFirst, wireFrameOn, muteBackgroundAudio, restoreBackgroundAudio } = useContext(MainContext);
  const containerRef = useRef(null);
  
  const [activeEffect, setActiveEffect] = useState('core');
  const activeEffectRef = useRef('core');
  const [nebulaHint, setNebulaHint] = useState('');

  const [progressStep, setProgressStep] = useState(0);
  const [hudGlowKey, setHudGlowKey] = useState(0);

  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const icoRef = useRef(null);
  const icoLinesRef = useRef(null);
  const geometryRef = useRef(null);
  const explosionProgressRef = useRef({ value: 0 });

  const materialRef = useRef(null);
  const material1Ref = useRef(null);
  const orbitGroupRef = useRef(null);
  const coreGroupRef = useRef(null);
  
  const nucleiGroupRef = useRef(null);
  const nucleiDataRef = useRef(null);
  
  const speedMultiplierRef = useRef(1);
  const targetSpeedRef = useRef(1);

  const mouseNormRef = useRef({ x: 0, y: 0 });
  const targetMouseNormRef = useRef({ x: 0, y: 0 });

  const miniGroupRef = useRef(null);
  const miniNebulaeRef = useRef([]);
  const clickCountRef = useRef(0);
  const overloadCountRef = useRef(0);
  const nervousIntensityRef = useRef(0);
  const isMorphingRef = useRef(false); 
  const isTransitioningRef = useRef(false);

  const cooldownTimerRef = useRef(null);

  const flashRef = useRef(null);
  const shockwaveRef = useRef(null);
  const dustRef = useRef(null);

  const openMyWorkRef = useRef(openMyWork);
  const openAboutmeRef = useRef(openAboutme);

  useEffect(() => {
    openMyWorkRef.current = openMyWork;
  }, [openMyWork]);

  useEffect(() => {
    openAboutmeRef.current = openAboutme;
  }, [openAboutme]);

  useEffect(() => {
    activeEffectRef.current = activeEffect;
    const isMobile = window.innerWidth <= 767.98;
    const actionWord = isMobile ? "Touch" : "Click / Space";

    if (activeEffect === 'nebula') {
      setNebulaHint(`${actionWord} to synthesize micro-nebulae [0/4]`);
      setProgressStep(0);
    } else {
      setNebulaHint("");
    }

    if (activeEffect !== 'nebula') {
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current);
        cooldownTimerRef.current = null;
      }

      if (miniGroupRef.current) {
        miniNebulaeRef.current.forEach(item => {
          miniGroupRef.current.remove(item.mesh);
          item.mesh.traverse(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
          });
        });
        miniNebulaeRef.current = [];
        clickCountRef.current = 0;
        overloadCountRef.current = 0;
        nervousIntensityRef.current = 0;
        setProgressStep(0);
      }
    }
  }, [activeEffect]);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    const camera = new THREE.PerspectiveCamera(95, window.innerWidth / window.innerHeight, 0.001, 1000);
    camera.position.set(0, 0, 2);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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
    geometry1 = geometry1.toNonIndexed();
    geometryRef.current = geometry1;

    const posAttr = geometry1.attributes.position;
    const count = posAttr.count;
    
    const initialPositions = new Float32Array(posAttr.array);
    geometry1.setAttribute('aInitialPosition', new THREE.BufferAttribute(initialPositions, 3));
    
    const explosionDirs = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 3) {
      const cx = (posAttr.getX(i) + posAttr.getX(i+1) + posAttr.getX(i+2)) / 3;
      const cy = (posAttr.getY(i) + posAttr.getY(i+1) + posAttr.getY(i+2)) / 3;
      const cz = (posAttr.getZ(i) + posAttr.getZ(i+1) + posAttr.getZ(i+2)) / 3;
      
      const len = Math.sqrt(cx*cx + cy*cy + cz*cz) || 1;
      const dirX = (cx / len) * (1.8 + Math.random() * 1.5) + (Math.random() - 0.5) * 2.0;
      const dirY = (cy / len) * (1.8 + Math.random() * 1.5) + (Math.random() - 0.5) * 2.0;
      const dirZ = (cz / len) * (1.8 + Math.random() * 1.5) + (Math.random() - 0.5) * 2.0;
      
      for (let j = 0; j < 3; j++) {
        explosionDirs[(i + j) * 3 + 0] = dirX;
        explosionDirs[(i + j) * 3 + 1] = dirY;
        explosionDirs[(i + j) * 3 + 2] = dirZ;
      }
    }
    geometry1.setAttribute('aExplosionDir', new THREE.BufferAttribute(explosionDirs, 3));

    let bary = [];
    for(let i = 0; i < count; i += 3) bary.push(0,0,1, 0,1,0, 1,0,0);
    geometry1.setAttribute('aBary', new THREE.BufferAttribute(new Float32Array(bary), 3));

    const coreGroup = new THREE.Group();
    scene.add(coreGroup);
    coreGroupRef.current = coreGroup;

    const ico = new THREE.Mesh(geometry1, material);
    const icoLines = new THREE.Mesh(geometry1, material1);
    coreGroup.add(ico, icoLines);
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

    const nucleiGroup = new THREE.Group();
    orbitGroup.add(nucleiGroup);
    nucleiGroupRef.current = nucleiGroup;

    const miniGroup = new THREE.Group();
    scene.add(miniGroup);
    miniGroupRef.current = miniGroup;

    const nucleiGeo = new THREE.SphereGeometry(0.025, 16, 16);
    const nucleiMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const nucleiCount = 8;
    const nucleiData = [];

    for (let i = 0; i < nucleiCount; i++) {
      const mesh = new THREE.Mesh(nucleiGeo, nucleiMat);
      nucleiGroup.add(mesh);
        
      nucleiData.push({
        mesh: mesh,
        angle: (i / nucleiCount) * Math.PI * 2,
        speed: 0.5 + Math.random() * 1.5,
        ringType: i % 2 === 0 ? 'vertical' : 'horizontal'
      });
    }
      
    nucleiDataRef.current = nucleiData;
    nucleiGroup.scale.set(0, 0, 0);

    const flashGeo = new THREE.SphereGeometry(2.0, 32, 32);
    const flashMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthTest: false
    });
    const flashMesh = new THREE.Mesh(flashGeo, flashMat);
    scene.add(flashMesh);
    flashRef.current = { mesh: flashMesh, mat: flashMat };

    const shockwaveGroup = new THREE.Group();
    scene.add(shockwaveGroup);

    const shockGeo = new THREE.RingGeometry(0.1, 1.2, 64);
    const shockMat1 = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthTest: false
    });
    const shockMat2 = new THREE.MeshBasicMaterial({
      color: 0xb3b3b3,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthTest: false
    });

    const shockRing1 = new THREE.Mesh(shockGeo, shockMat1);
    const shockRing2 = new THREE.Mesh(shockGeo, shockMat2);
    shockwaveGroup.add(shockRing1, shockRing2);
    shockwaveRef.current = { group: shockwaveGroup, ring1: shockRing1, ring2: shockRing2, mat1: shockMat1, mat2: shockMat2 };

    const squareGeo = new THREE.PlaneGeometry(0.045, 0.045);
    const circleGeo = new THREE.CircleGeometry(0.025, 6);
    
    const triShape = new THREE.Shape();
    triShape.moveTo(0, 0.035);
    triShape.lineTo(-0.03, -0.02);
    triShape.lineTo(0.03, -0.02);
    triShape.closePath();
    const triangleGeo = new THREE.ShapeGeometry(triShape);

    const dustMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthTest: false
    });

    const totalParticles = 780;
    const countPerType = totalParticles / 3;

    const squareMesh = new THREE.InstancedMesh(squareGeo, dustMat, countPerType);
    const circleMesh = new THREE.InstancedMesh(circleGeo, dustMat, countPerType);
    const triangleMesh = new THREE.InstancedMesh(triangleGeo, dustMat, countPerType);

    scene.add(squareMesh, circleMesh, triangleMesh);

    const dustParticles = [];
    const meshes = [squareMesh, circleMesh, triangleMesh];

    meshes.forEach((mesh) => {
      for (let i = 0; i < countPerType; i++) {
        dustParticles.push({
          mesh: mesh,
          index: i,
          position: new THREE.Vector3(0, 0, 0),
          velocity: new THREE.Vector3(0, 0, 0),
          rot: new THREE.Vector3(Math.random() * Math.PI, Math.random() * Math.PI, 0),
          rotSpeed: new THREE.Vector3(
            (Math.random() - 0.5) * 0.1,
            (Math.random() - 0.5) * 0.1,
            (Math.random() - 0.5) * 0.1
          )
        });
      }
    });

    dustRef.current = { particles: dustParticles, squareMesh, circleMesh, triangleMesh, mat: dustMat, active: false };

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

      TWEEN.update();

      mouseNormRef.current.x += (targetMouseNormRef.current.x - mouseNormRef.current.x) * 0.05;
      mouseNormRef.current.y += (targetMouseNormRef.current.y - mouseNormRef.current.y) * 0.05;

      if (activeEffectRef.current === 'nebula') {
        camera.position.x += (mouseNormRef.current.x * 0.12 - camera.position.x) * 0.03;
        camera.position.y += (mouseNormRef.current.y * 0.12 - camera.position.y) * 0.03;
      } else {
        camera.position.x += (0 - camera.position.x) * 0.05;
        camera.position.y += (0 - camera.position.y) * 0.05;
      }

      const lerpFactor = activeEffectRef.current === 'nebula' ? 0.01 : 0.05;
      currentMouse += (targetMouse - currentMouse) * lerpFactor;
      targetMouse *= activeEffectRef.current === 'nebula' ? 0.8 : 0.9;
        
      speedMultiplierRef.current += (targetSpeedRef.current - speedMultiplierRef.current) * 0.02;
      time += 0.002 * speedMultiplierRef.current;

      const isAboutme = openAboutmeRef.current;
      const rotationSpeedFactor = isAboutme ? 1.0 : (activeEffectRef.current === 'nebula' ? 0.55 : 0.3);

      scene.rotation.x = time * rotationSpeedFactor;
      scene.rotation.y = time * rotationSpeedFactor;

      orbitGroup.rotation.y -= 0.0015 * speedMultiplierRef.current;
      orbitGroup.rotation.z -= 0.001 * speedMultiplierRef.current;

      const prog = explosionProgressRef.current.value;
      if (geometryRef.current && prog > 0.001) {
        const geom = geometryRef.current;
        const pos = geom.attributes.position;
        const initPos = geom.attributes.aInitialPosition;
        const dirs = geom.attributes.aExplosionDir;

        for (let i = 0; i < pos.count; i++) {
          const ix = initPos.getX(i);
          const iy = initPos.getY(i);
          const iz = initPos.getZ(i);

          const dx = dirs.getX(i);
          const dy = dirs.getY(i);
          const dz = dirs.getZ(i);

          pos.setXYZ(i, ix + dx * prog, iy + dy * prog, iz + dz * prog);
        }
        pos.needsUpdate = true;
      }

      if (dustRef.current && dustRef.current.active) {
        const speedFactor = speedMultiplierRef.current * 2.2;
        const dummy = new THREE.Object3D();

        dustRef.current.particles.forEach((p) => {
          p.position.addScaledVector(p.velocity, speedFactor);
          p.rot.x += p.rotSpeed.x;
          p.rot.y += p.rotSpeed.y;

          dummy.position.copy(p.position);
          dummy.rotation.set(p.rot.x, p.rot.y, p.rot.z);
          dummy.scale.setScalar(0.9);
          dummy.updateMatrix();

          p.mesh.setMatrixAt(p.index, dummy.matrix);
        });

        dustRef.current.squareMesh.instanceMatrix.needsUpdate = true;
        dustRef.current.circleMesh.instanceMatrix.needsUpdate = true;
        dustRef.current.triangleMesh.instanceMatrix.needsUpdate = true;
      }

      if (miniNebulaeRef.current.length > 0) {
        miniNebulaeRef.current.forEach((item, idx) => {
          if (!item.isExploding) {
            item.angle += item.orbitSpeed;
            item.mesh.position.x = Math.cos(item.angle) * item.distance;
            item.mesh.position.z = Math.sin(item.angle) * item.distance;

            item.mesh.position.x += (Math.random() - 0.5) * 0.02;
            item.mesh.position.y += (Math.random() - 0.5) * 0.02;
            item.mesh.position.z += (Math.random() - 0.5) * 0.02;

            const pulse = Math.sin(time * 8.0 + idx * 1.5) * 0.5 + 0.5;
            const erraticPulse = Math.pow(pulse, 3.0);

            const coreMesh = item.mesh.children[1];
            if (coreMesh) {
              const scaleVariation = 1.0 + erraticPulse * 0.6;
              coreMesh.scale.set(scaleVariation, scaleVariation, scaleVariation);
              if (coreMesh.material) {
                coreMesh.material.opacity = 0.5 + erraticPulse * 0.5;
                coreMesh.material.transparent = true;
              }
            }

            const wireMesh = item.mesh.children[0];
            if (wireMesh && wireMesh.material) {
              wireMesh.material.opacity = 0.4 + erraticPulse * 0.5;
            }
          }

          item.mesh.rotation.x += 0.03 * (idx + 1);
          item.mesh.rotation.y += 0.04 * (idx + 1);
        });
      }

      if (ico && icoLines) {
        if (nervousIntensityRef.current > 0.01) {
          const shake = 0.035 * (overloadCountRef.current + 1) * nervousIntensityRef.current;
          ico.position.set((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake, 0);
          icoLines.position.copy(ico.position);
        } else if (isMorphingRef.current) {
          const morphShake = 0.03; 
          ico.position.set((Math.random() - 0.5) * morphShake, (Math.random() - 0.5) * morphShake, (Math.random() - 0.5) * morphShake);
          icoLines.position.copy(ico.position);
        } else {
          ico.position.set(0, 0, 0);
          icoLines.position.set(0, 0, 0);
        }
      }

      if (nucleiDataRef.current) {
        nucleiDataRef.current.forEach(data => {
          const quantumSpeedModifier = activeEffectRef.current === 'quantum' ? 0.5 : 1.0;
          data.angle += 0.015 * speedMultiplierRef.current * data.speed * quantumSpeedModifier;
          const radius = 1.5;

          if (data.ringType === 'vertical') {
            data.mesh.position.set(0, Math.cos(data.angle) * radius, Math.sin(data.angle) * radius);
          } else {
            data.mesh.position.set(Math.cos(data.angle) * radius, 0, Math.sin(data.angle) * radius);
          }
        });
      }

      let burnSpikes = 0;
      if (activeEffectRef.current === 'nebula') {
        const flare = Math.max(0, Math.sin(time * 5.0) * Math.cos(time * 2.5));
        const subtleSpikes = Math.pow(flare, 2.5) * 0.65;
        const nervousMultiplier = 1.0 + nervousIntensityRef.current * (2.0 + Math.sin(time * 20.0) * 2.0);
        burnSpikes = (0.08 + subtleSpikes) * nervousMultiplier;
      }

      const finalMouseValue = Math.max(currentMouse * 0.2, burnSpikes);

      material.uniforms.time.value = time;
      material.uniforms.mouse.value = finalMouseValue;
      material1.uniforms.time.value = time;
      material1.uniforms.mouse.value = finalMouseValue;
        
      if (customPass.uniforms["time"]) {
        customPass.uniforms["time"].value = time;
      }

      composer.render();
    };

    animate();

    const handleMouseMove = (e) => {
      targetMouseNormRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouseNormRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;

      let speed = Math.sqrt((e.pageX - lastX) ** 2 + (e.pageY - lastY) ** 2) * 0.1;
      if (activeEffectRef.current === 'nebula') {
        speed *= 0.02;
      }
      targetMouse = Math.min(speed, activeEffectRef.current === 'nebula' ? 0.1 : 5);
      lastX = e.pageX; lastY = e.pageY;
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        const touch = e.touches[0];
        targetMouseNormRef.current.x = (touch.clientX / window.innerWidth) * 2 - 1;
        targetMouseNormRef.current.y = -(touch.clientY / window.innerHeight) * 2 + 1;

        let speed = Math.sqrt((touch.pageX - lastX) ** 2 + (touch.pageY - lastY) ** 2) * 0.1;
        if (activeEffectRef.current === 'nebula') {
          speed *= 0.02;
        }
        targetMouse = Math.min(speed, activeEffectRef.current === 'nebula' ? 0.1 : 5);
        lastX = touch.pageX; lastY = touch.pageY;
      }
    };

    const handleTouchStart = (e) => {
      if (e.touches && e.touches[0]) {
        lastX = e.touches[0].pageX;
        lastY = e.touches[0].pageY;
      }
    };

    const resetInstability = () => {
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current);
        cooldownTimerRef.current = null;
      }

      stopDangerSound();
      playCoolingDownSound();

      if (materialRef.current) {
        new TWEEN.Tween(materialRef.current.uniforms.mouse)
          .to({ value: 0.08 }, 1500)
          .easing(TWEEN.Easing.Cubic.Out)
          .start();
      }

      const intensityObj = { val: nervousIntensityRef.current };
      new TWEEN.Tween(intensityObj)
        .to({ val: 0 }, 1500)
        .easing(TWEEN.Easing.Cubic.Out)
        .onUpdate(() => {
          nervousIntensityRef.current = intensityObj.val;
        })
        .onComplete(() => {
          overloadCountRef.current = 0;
        })
        .start();

      miniNebulaeRef.current.forEach((item) => {
        new TWEEN.Tween(item.mesh.scale)
          .to({ x: 1, y: 1, z: 1 }, 1500)
          .easing(TWEEN.Easing.Cubic.Out)
          .start();
      });

      const currentStep = 4 + overloadCountRef.current;
      const progressObj = { step: currentStep };
      
      new TWEEN.Tween(progressObj)
        .to({ step: 4 }, 1500)
        .easing(TWEEN.Easing.Linear.None)
        .onUpdate(() => {
          setProgressStep(Math.round(progressObj.step));
        })
        .start();

      const isMobile = window.innerWidth <= 767.98;
      const actionWord = isMobile ? "Touch" : "Click / Space";
      setNebulaHint(`Core cooled down. ${actionWord} to overload core`);
    };

    const triggerNebulaInteraction = (target = null) => {
      if (activeEffectRef.current !== 'nebula') return;
      if (document.querySelector('.mobilemenu-active')) return;
      if (target && target.closest && (
        target.closest('.canvas_effects_controls') || 
        target.closest('button') || 
        target.closest('.audio-controls-wrapper') ||
        target.closest('header') ||
        target.closest('.mobile-menu-cont')
      )) return;

      const isMobile = window.innerWidth <= 767.98;
      const m = isMobile ? 0.6 : 1;
      const actionWord = isMobile ? "Touch" : "Click / Space";

      setHudGlowKey(prev => prev + 1);

      if (icoRef.current && icoLinesRef.current) {
        new TWEEN.Tween(icoRef.current.scale)
          .to({ x: 1.35 * m, y: 1.35 * m, z: 1.35 * m }, 350)
          .easing(TWEEN.Easing.Sinusoidal.InOut)
          .chain(
            new TWEEN.Tween(icoRef.current.scale)
              .to({ x: 1.25 * m, y: 1.25 * m, z: 1.25 * m }, 450)
              .easing(TWEEN.Easing.Sinusoidal.InOut)
          )
          .start();

        new TWEEN.Tween(icoLinesRef.current.scale)
          .to({ x: 1.45 * m, y: 1.45 * m, z: 1.45 * m }, 350)
          .easing(TWEEN.Easing.Sinusoidal.InOut)
          .chain(
            new TWEEN.Tween(icoLinesRef.current.scale)
              .to({ x: 1.35 * m, y: 1.35 * m, z: 1.35 * m }, 450)
              .easing(TWEEN.Easing.Sinusoidal.InOut)
          )
          .start();
      }

      if (clickCountRef.current < 4) {
        clickCountRef.current += 1;
        setProgressStep(clickCountRef.current);
        setNebulaHint(`Synthesizing cosmic nodes [${clickCountRef.current}/4]`);
        playMaterializeSound();
        const miniNode = new THREE.Group();

        const icoGeo = new THREE.IcosahedronGeometry(0.22, 0);
        const icoMat = new THREE.MeshBasicMaterial({ 
          color: 0xb3b3b3, 
          wireframe: true, 
          transparent: true, 
          opacity: 0.9,
          depthTest: false 
        });
        const icoMesh = new THREE.Mesh(icoGeo, icoMat);
        miniNode.add(icoMesh);

        const coreGeo = new THREE.SphereGeometry(0.035, 8, 8);
        const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff, depthTest: false });
        const coreMesh = new THREE.Mesh(coreGeo, coreMat);
        miniNode.add(coreMesh);

        miniNode.renderOrder = 999;

        const distance = 1.6 + Math.random() * 0.8;
        const initialAngle = Math.random() * Math.PI * 2;
        const orbitSpeed = (Math.random() > 0.5 ? 1 : -1) * (0.003 + Math.random() * 0.004);

        const startX = Math.cos(initialAngle) * distance;
        const startZ = Math.sin(initialAngle) * distance;
        const startY = (Math.random() - 0.5) * 1.2;

        miniNode.position.set(0, 0, 0);
        miniNode.scale.set(0, 0, 0);
        miniGroup.add(miniNode);

        miniNebulaeRef.current.push({
          mesh: miniNode,
          angle: initialAngle,
          distance: distance,
          orbitSpeed: orbitSpeed,
          isExploding: false
        });

        new TWEEN.Tween(miniNode.position)
          .to({ x: startX, y: startY, z: startZ }, 700)
          .easing(TWEEN.Easing.Back.Out)
          .start();

        new TWEEN.Tween(miniNode.scale)
          .to({ x: 1, y: 1, z: 1 }, 600)
          .easing(TWEEN.Easing.Back.Out)
          .start();

      } else {
        if (cooldownTimerRef.current) {
          clearTimeout(cooldownTimerRef.current);
          cooldownTimerRef.current = null;
        }

        overloadCountRef.current += 1;
        setProgressStep(4 + overloadCountRef.current);
        nervousIntensityRef.current = 1.0;

        if (overloadCountRef.current === 1) {
          playDangerSound(0.3);
          setNebulaHint(`WARNING: Core instability rising (${overloadCountRef.current}/3)`);
          
          cooldownTimerRef.current = window.setTimeout(resetInstability, 10000);

          new TWEEN.Tween(material.uniforms.mouse)
            .to({ value: 2.5 }, 300)
            .start();

          miniNebulaeRef.current.forEach((item) => {
            const currentScale = item.mesh.scale.x;
            new TWEEN.Tween(item.mesh.scale)
              .to({ x: currentScale * 1.3, y: currentScale * 1.3, z: currentScale * 1.3 }, 150)
              .yoyo(true)
              .repeat(1)
              .easing(TWEEN.Easing.Quadratic.Out)
              .start();
          });
        } else if (overloadCountRef.current === 2) {
          updateDangerVolume(0.6);
          setNebulaHint(`WARNING: Core instability rising (${overloadCountRef.current}/3)`);
          
          cooldownTimerRef.current = window.setTimeout(resetInstability, 10000);

          new TWEEN.Tween(material.uniforms.mouse)
            .to({ value: 4.5 }, 300)
            .start();

          miniNebulaeRef.current.forEach((item) => {
            const currentScale = item.mesh.scale.x;
            new TWEEN.Tween(item.mesh.scale)
              .to({ x: currentScale * 1.3, y: currentScale * 1.3, z: currentScale * 1.3 }, 150)
              .yoyo(true)
              .repeat(1)
              .easing(TWEEN.Easing.Quadratic.Out)
              .start();
          });
        } else {
          stopDangerSound();
          playExplosionSound();
          setNebulaHint("CRITICAL OVERLOAD — DISCHARGING");
          nervousIntensityRef.current = 0;

          targetSpeedRef.current = 0.02;

          if (orbitGroupRef.current) {
            orbitGroupRef.current.visible = false;
          }

          if (flashRef.current) {
            flashRef.current.mat.opacity = 1.0;
            flashRef.current.mesh.scale.set(0.1, 0.1, 0.1);
            new TWEEN.Tween(flashRef.current.mesh.scale)
              .to({ x: 3.5, y: 3.5, z: 3.5 }, 250)
              .easing(TWEEN.Easing.Exponential.Out)
              .start();
            new TWEEN.Tween(flashRef.current.mat)
              .to({ opacity: 0 }, 300)
              .easing(TWEEN.Easing.Cubic.Out)
              .start();
          }

          if (shockwaveRef.current) {
            const { ring1, ring2, mat1, mat2 } = shockwaveRef.current;
            ring1.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
            ring2.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);

            ring1.scale.set(0.01, 0.01, 0.01);
            ring2.scale.set(0.01, 0.01, 0.01);
            mat1.opacity = 0.95;
            mat2.opacity = 0.85;

            new TWEEN.Tween(ring1.scale)
              .to({ x: 24, y: 24, z: 24 }, 550)
              .easing(TWEEN.Easing.Exponential.Out)
              .start();
            new TWEEN.Tween(mat1)
              .to({ opacity: 0 }, 550)
              .easing(TWEEN.Easing.Cubic.Out)
              .start();

            new TWEEN.Tween(ring2.scale)
              .to({ x: 20, y: 20, z: 20 }, 650)
              .easing(TWEEN.Easing.Exponential.Out)
              .start();
            new TWEEN.Tween(mat2)
              .to({ opacity: 0 }, 650)
              .easing(TWEEN.Easing.Cubic.Out)
              .start();
          }

          if (dustRef.current) {
            dustRef.current.particles.forEach((p) => {
              p.position.set(0, 0, 0);
              const dir = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2
              ).normalize();
              const speed = 0.05 + Math.random() * 0.16;
              p.velocity.copy(dir.multiplyScalar(speed));
            });

            dustRef.current.mat.opacity = 1.0;
            dustRef.current.active = true;

            new TWEEN.Tween(dustRef.current.mat)
              .to({ opacity: 0 }, 2500)
              .easing(TWEEN.Easing.Cubic.In)
              .onComplete(() => {
                if (dustRef.current) dustRef.current.active = false;
              })
              .start();
          }

          explosionProgressRef.current.value = 0;
          new TWEEN.Tween(explosionProgressRef.current)
            .to({ value: 1.4 }, 350)
            .easing(TWEEN.Easing.Exponential.Out)
            .chain(
              new TWEEN.Tween(explosionProgressRef.current)
                .to({ value: 0 }, 1800)
                .easing(TWEEN.Easing.Cubic.Out)
            )
            .start();

          miniNebulaeRef.current.forEach((item, index) => {
            item.isExploding = true;

            const pos = item.mesh.position;
            let dir = new THREE.Vector3(pos.x, pos.y, pos.z).normalize();
            if (dir.length() === 0) {
              dir = new THREE.Vector3((Math.random() - 0.5), (Math.random() - 0.5), (Math.random() - 0.5)).normalize();
            }

            const blastDistance = 25 + Math.random() * 15; 
            const targetX = dir.x * blastDistance;
            const targetY = dir.y * blastDistance;
            const targetZ = dir.z * blastDistance;

            new TWEEN.Tween(item.mesh.position)
              .to({ x: targetX, y: targetY, z: targetZ }, 450)
              .easing(TWEEN.Easing.Exponential.Out)
              .start();

            new TWEEN.Tween(item.mesh.scale)
              .to({ x: 0, y: 0, z: 0 }, 350)
              .delay(index * 15)
              .easing(TWEEN.Easing.Exponential.In)
              .onComplete(() => {
                miniGroup.remove(item.mesh);
                item.mesh.traverse(child => {
                  if (child.geometry) child.geometry.dispose();
                  if (child.material) child.material.dispose();
                });
              })
              .start();
          });

          if (icoRef.current && icoLinesRef.current) {
            icoRef.current.position.set(0, 0, 0);
            icoLinesRef.current.position.set(0, 0, 0);

            new TWEEN.Tween(material.uniforms.mouse)
              .to({ value: 5.0 }, 150)
              .chain(
                new TWEEN.Tween(material.uniforms.mouse)
                  .to({ value: 0.5 }, 2000)
              )
              .start();

            new TWEEN.Tween(icoRef.current.scale)
              .to({ x: 2.1 * m, y: 2.1 * m, z: 2.1 * m }, 200)
              .easing(TWEEN.Easing.Exponential.Out)
              .chain(
                new TWEEN.Tween(icoRef.current.scale)
                  .to({ x: 1.25 * m, y: 1.25 * m, z: 1.25 * m }, 2000)
                  .easing(TWEEN.Easing.Cubic.Out)
              )
              .start();

            new TWEEN.Tween(icoLinesRef.current.scale)
              .to({ x: 2.2 * m, y: 2.2 * m, z: 2.2 * m }, 200)
              .easing(TWEEN.Easing.Exponential.Out)
              .chain(
                new TWEEN.Tween(icoLinesRef.current.scale)
                  .to({ x: 1.35 * m, y: 1.35 * m, z: 1.35 * m }, 2000)
                  .easing(TWEEN.Easing.Cubic.Out)
              )
              .start();
          }

          miniNebulaeRef.current = [];
          clickCountRef.current = 0;
          overloadCountRef.current = 0;

          setTimeout(() => {
            if (activeEffectRef.current === 'nebula') {
              const isMob = window.innerWidth <= 767.98;
              targetSpeedRef.current = isMob ? 0.35 : 0.15;
            }
          }, 2000);

          setTimeout(() => {
            if (orbitGroupRef.current && activeEffectRef.current === 'nebula') {
              orbitGroupRef.current.visible = true;
              orbitGroupRef.current.scale.set(0.5 * m, 0.5 * m, 0.5 * m);
            }
            setNebulaHint(`Core stabilized. ${actionWord} to synthesize [0/4]`);
            setProgressStep(0);
          }, 3000);
        }
      }
    };

    const handleClick = (e) => {
      triggerNebulaInteraction(e.target);
    };

    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.key === ' ') {
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
        if (document.querySelector('.mobilemenu-active')) return;
        if (activeEffectRef.current === 'nebula') {
          e.preventDefault();
          triggerNebulaInteraction(null);
        }
      }
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('click', handleClick);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current);
      }
      
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);

      if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
      geometry1.dispose();
      material.dispose();
      material1.dispose();
      ringGeo.dispose();
      ringMaterial.dispose();
      nucleiGeo.dispose();
      nucleiMat.dispose();
      flashGeo.dispose();
      flashMat.dispose();
      shockGeo.dispose();
      shockMat1.dispose();
      shockMat2.dispose();
      squareGeo.dispose();
      circleGeo.dispose();
      triangleGeo.dispose();
      dustMat.dispose();
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const { camera, material, material1, orbitGroup, coreGroup } = { 
        camera: cameraRef.current, material: materialRef.current, 
        material1: material1Ref.current, orbitGroup: orbitGroupRef.current, coreGroup: coreGroupRef.current
    };
      
    if (!camera || !orbitGroup || !coreGroup || !container) return;

    requestAnimationFrame(() => { container.style.opacity = '1'; });
    container.style.pointerEvents = openMyWork ? 'none' : 'auto';

    if (openAboutme || openMyWork) {
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current);
        cooldownTimerRef.current = null;
      }
      stopWindNebulaSound();
      stopDangerSound();
      if (restoreBackgroundAudio) restoreBackgroundAudio();
    }

    if (openAboutme) {
      material.wireframe = true; material1.wireframe = true;
      coreGroup.visible = true; orbitGroup.visible = false;
        
      new TWEEN.Tween(coreGroup.position).to({ x: -1 }, 1000).easing(TWEEN.Easing.Quadratic.Out).start();
      new TWEEN.Tween(camera.position).to({ z: 1 }, 1000).easing(TWEEN.Easing.Quadratic.Out).start();
      setActiveEffect('core');
    } else if (openMyWork) {
      coreGroup.visible = false; orbitGroup.visible = false; 
      setActiveEffect('core');
    } else if (openFirst) {
      material.wireframe = false; material1.wireframe = false;
      coreGroup.visible = true; orbitGroup.visible = true;

      new TWEEN.Tween(coreGroup.position).to({ x: 0 }, 1000).easing(TWEEN.Easing.Quadratic.Out).start();
      new TWEEN.Tween(camera.position).to({ z: 2 }, 1000).easing(TWEEN.Easing.Quadratic.Out).start();
    }
      
    material.needsUpdate = true; material1.needsUpdate = true;
  }, [openAboutme, openMyWork, openFirst, restoreBackgroundAudio]);

  useEffect(() => {
    const { ico, icoLines, orbitGroup, nucleiGroup } = { 
      ico: icoRef.current, icoLines: icoLinesRef.current, orbitGroup: orbitGroupRef.current, nucleiGroup: nucleiGroupRef.current 
    };
      
    if (!ico || !icoLines || !orbitGroup || !nucleiGroup) return;

    const duration = 1200;
    const isMobile = window.innerWidth <= 767.98;
    const m = isMobile ? 0.6 : 1;

    if (activeEffect === 'core') {
      targetSpeedRef.current = 1;
      new TWEEN.Tween(ico.scale).to({ x: 1 * m, y: 1 * m, z: 1 * m }, duration).easing(TWEEN.Easing.Cubic.Out).start();
      new TWEEN.Tween(icoLines.scale).to({ x: 1 * m, y: 1 * m, z: 1 * m }, duration).easing(TWEEN.Easing.Cubic.Out).start();
      new TWEEN.Tween(orbitGroup.scale).to({ x: 1 * m, y: 1 * m, z: 1 * m }, duration).easing(TWEEN.Easing.Cubic.Out).start();
      new TWEEN.Tween(nucleiGroup.scale).to({ x: 0, y: 0, z: 0 }, duration).easing(TWEEN.Easing.Cubic.Out).start();
    
    } else if (activeEffect === 'quantum') {
      targetSpeedRef.current = 1.8; 
      new TWEEN.Tween(ico.scale).to({ x: 0.01, y: 0.01, z: 0.01 }, duration).easing(TWEEN.Easing.Cubic.Out).start();
      new TWEEN.Tween(icoLines.scale).to({ x: 1.3 * m, y: 1.3 * m, z: 1.3 * m }, duration).easing(TWEEN.Easing.Cubic.Out).start();
      new TWEEN.Tween(orbitGroup.scale).to({ x: 1.5 * m, y: 1.5 * m, z: 1.5 * m }, duration).easing(TWEEN.Easing.Cubic.Out).start();
      new TWEEN.Tween(nucleiGroup.scale).to({ x: 1 * m, y: 1 * m, z: 1 * m }, duration).easing(TWEEN.Easing.Cubic.Out).start();
    
    } else if (activeEffect === 'nebula') {
      targetSpeedRef.current = isMobile ? 0.35 : 0.15;
      new TWEEN.Tween(ico.scale).to({ x: 1.25 * m, y: 1.25 * m, z: 1.25 * m }, duration).easing(TWEEN.Easing.Cubic.Out).start();
      new TWEEN.Tween(icoLines.scale).to({ x: 1.35 * m, y: 1.35 * m, z: 1.35 * m }, duration).easing(TWEEN.Easing.Cubic.Out).start();
      new TWEEN.Tween(orbitGroup.scale).to({ x: 0.5 * m, y: 0.5 * m, z: 0.5 * m }, duration).easing(TWEEN.Easing.Cubic.Out).start();
      new TWEEN.Tween(nucleiGroup.scale).to({ x: 0, y: 0, z: 0 }, duration).easing(TWEEN.Easing.Cubic.Out).start();
    }

  }, [activeEffect]);

  const handleEffectChange = (effect) => {
    if (activeEffect === effect || isTransitioningRef.current) return;

    isTransitioningRef.current = true;

    if (effect === 'nebula') {
      playCoreTransitionSound(); 

      setTimeout(() => {
        playWindNebulaSound();
      }, 400);

      if (muteBackgroundAudio) {
        muteBackgroundAudio();
      }
    } else {
      stopWindNebulaSound();
      stopDangerSound();
      if (restoreBackgroundAudio) {
        restoreBackgroundAudio();
      }
      playCoreTransitionSound();
    }

    setActiveEffect(effect);

    const duration = 1200;
    isMorphingRef.current = true;

    setTimeout(() => {
      isMorphingRef.current = false;
      isTransitioningRef.current = false;
    }, duration);
  };

  const hudAnimationClass = hudGlowKey > 0 ? 'animate-glow' : '';

  return (
    <>
      <NebulaCursor isActive={activeEffect === 'nebula' && openFirst} />

      <div 
        ref={containerRef} 
        className='home_container_cont'
        style={{ transition: 'opacity 0.5s ease-in-out' }}
      ></div>

      <div className={`canvas_effects_controls ${openFirst ? 'visible' : 'hidden'}`}>
        <button 
          className={activeEffect === 'core' ? 'active' : ''} 
          onClick={() => handleEffectChange('core')}
        >
          CORE
        </button>
        <button 
          className={activeEffect === 'quantum' ? 'active' : ''} 
          onClick={() => handleEffectChange('quantum')}
        >
          QUANTUM
        </button>
        <button 
          className={activeEffect === 'nebula' ? 'active' : ''} 
          onClick={() => handleEffectChange('nebula')}
        >
          NEBULA
        </button>
      </div>

      {activeEffect === 'nebula' && openFirst && nebulaHint && (
        <div 
          key={hudGlowKey}
          className={`nebula_hud_hint ${hudAnimationClass}`}
        >
          <div>{nebulaHint}</div>

          <div className="nebula_progress_bar">
            {[1, 2, 3, 4, 5, 6, 7].map((step) => {
              const isActive = step <= progressStep;
              let modifierClass = '';
              if (isActive) {
                modifierClass = step <= 4 ? 'active-synth' : 'active-intense';
              }

              return (
                <div 
                  key={step} 
                  className={`nebula_progress_segment ${modifierClass}`}
                />
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

export default HomeCanvas;