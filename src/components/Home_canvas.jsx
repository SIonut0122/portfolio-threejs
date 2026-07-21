import { useEffect, useRef, useContext, useState } from 'react';
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
  
  const [activeEffect, setActiveEffect] = useState('core');
  const activeEffectRef = useRef('core');
  const [nebulaHint, setNebulaHint] = useState('');

  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const icoRef = useRef(null);
  const icoLinesRef = useRef(null);
  const geometryRef = useRef(null);
  const explosionProgressRef = useRef({ value: 0 });

  const materialRef = useRef(null);
  const material1Ref = useRef(null);
  const orbitGroupRef = useRef(null);
  
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
  const isNervousRef = useRef(false);

  const openMyWorkRef = useRef(openMyWork);
  const myWorkActiveTime = useRef(0);

  useEffect(() => {
    openMyWorkRef.current = openMyWork;
  }, [openMyWork]);

  useEffect(() => {
    activeEffectRef.current = activeEffect;
    const isMobile = window.innerWidth <= 767.98;
    const actionWord = isMobile ? "Tap" : "Click";

    if (activeEffect === 'nebula') {
      setNebulaHint(`${actionWord} canvas to synthesize micro-nebulae [0/4]`);
    } else {
      setNebulaHint("");
    }

    if (activeEffect !== 'nebula' && miniGroupRef.current) {
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
      isNervousRef.current = false;
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

      if (openMyWorkRef.current) {
        if (myWorkActiveTime.current === 0) myWorkActiveTime.current = performance.now();
        if (performance.now() - myWorkActiveTime.current > 1500) {
          return;
        }
      } else {
        myWorkActiveTime.current = 0;
      }

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

      const rotationSpeedFactor = activeEffectRef.current === 'nebula' ? 0.55 : 0.3;
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

      if (miniNebulaeRef.current.length > 0) {
        miniNebulaeRef.current.forEach((item, idx) => {
          if (!item.isExploding) {
            item.angle += item.orbitSpeed;
            item.mesh.position.x = Math.cos(item.angle) * item.distance;
            item.mesh.position.z = Math.sin(item.angle) * item.distance;

            item.mesh.position.x += (Math.random() - 0.5) * 0.02;
            item.mesh.position.y += (Math.random() - 0.5) * 0.02;
            item.mesh.position.z += (Math.random() - 0.5) * 0.02;
          }

          item.mesh.rotation.x += 0.03 * (idx + 1);
          item.mesh.rotation.y += 0.04 * (idx + 1);
        });
      }

      if (isNervousRef.current && ico && icoLines) {
        const shake = 0.035 * (overloadCountRef.current + 1);
        ico.position.x = (Math.random() - 0.5) * shake;
        ico.position.y = (Math.random() - 0.5) * shake;
        icoLines.position.x = ico.position.x;
        icoLines.position.y = ico.position.y;
      }

      if (nucleiDataRef.current) {
        nucleiDataRef.current.forEach(data => {
          data.angle += 0.015 * speedMultiplierRef.current * data.speed;
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
        const nervousMultiplier = isNervousRef.current ? 3.0 + Math.sin(time * 20.0) * 2.0 : 1.0;
        burnSpikes = (0.08 + subtleSpikes) * nervousMultiplier;
      }

      const finalMouseValue = Math.max(currentMouse * 0.2, burnSpikes);

      material.uniforms.time.value = time;
      material.uniforms.mouse.value = finalMouseValue;
      material1.uniforms.time.value = time;
      material1.uniforms.mouse.value = finalMouseValue;
       
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

    const handleClick = (e) => {
      if (activeEffectRef.current !== 'nebula') return;
      if (e.target.closest('.canvas_effects_controls') || e.target.closest('button')) return;

      const isMobile = window.innerWidth <= 767.98;
      const m = isMobile ? 0.6 : 1;
      const actionWord = isMobile ? "Tap" : "Click";

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
        setNebulaHint(`Synthesizing cosmic nodes [${clickCountRef.current}/4]`);

        const miniNode = new THREE.Group();

        const icoGeo = new THREE.IcosahedronGeometry(0.22, 0);
        const icoMat = new THREE.MeshBasicMaterial({ 
          color: 0xcc33ff, 
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
        overloadCountRef.current += 1;
        isNervousRef.current = true;

        if (overloadCountRef.current === 1) {
          setNebulaHint(`WARNING: Core instability rising (${overloadCountRef.current}/3)`);
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
          setNebulaHint(`WARNING: Core instability rising (${overloadCountRef.current}/3)`);
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
          setNebulaHint("CRITICAL OVERLOAD — DISCHARGING");
          isNervousRef.current = false;

          if (orbitGroupRef.current) {
            orbitGroupRef.current.visible = false;
          }

          explosionProgressRef.current.value = 0;
          new TWEEN.Tween(explosionProgressRef.current)
            .to({ value: 1.2 }, 350)
            .easing(TWEEN.Easing.Exponential.Out)
            .chain(
              new TWEEN.Tween(explosionProgressRef.current)
                .to({ value: 0 }, 500)
                .easing(TWEEN.Easing.Cubic.In)
            )
            .start();

          miniNebulaeRef.current.forEach((item) => {
            item.isExploding = true;
          });

          if (icoRef.current && icoLinesRef.current) {
            icoRef.current.position.set(0, 0, 0);
            icoLinesRef.current.position.set(0, 0, 0);

            new TWEEN.Tween(material.uniforms.mouse)
              .to({ value: 5.0 }, 150)
              .chain(
                new TWEEN.Tween(material.uniforms.mouse)
                  .to({ value: 0.5 }, 600)
              )
              .start();

            new TWEEN.Tween(icoRef.current.scale)
              .to({ x: 1.9 * m, y: 1.9 * m, z: 1.9 * m }, 150)
              .easing(TWEEN.Easing.Exponential.Out)
              .chain(
                new TWEEN.Tween(icoRef.current.scale)
                  .to({ x: 1.25 * m, y: 1.25 * m, z: 1.25 * m }, 700)
                  .easing(TWEEN.Easing.Cubic.Out)
              )
              .start();

            new TWEEN.Tween(icoLinesRef.current.scale)
              .to({ x: 2.0 * m, y: 2.0 * m, z: 2.0 * m }, 150)
              .easing(TWEEN.Easing.Exponential.Out)
              .chain(
                new TWEEN.Tween(icoLinesRef.current.scale)
                  .to({ x: 1.35 * m, y: 1.35 * m, z: 1.35 * m }, 700)
                  .easing(TWEEN.Easing.Cubic.Out)
              )
              .start();
          }

          miniNebulaeRef.current.forEach((item, index) => {
            const randomEdgeX = (Math.random() - 0.5) * 10;
            const randomEdgeY = (Math.random() - 0.5) * 10;
            const randomEdgeZ = (Math.random() - 0.5) * 10;

            new TWEEN.Tween(item.mesh.position)
              .to({ x: randomEdgeX, y: randomEdgeY, z: randomEdgeZ }, 500)
              .easing(TWEEN.Easing.Exponential.Out)
              .start();

            new TWEEN.Tween(item.mesh.scale)
              .to({ x: 0.01, y: 0.01, z: 0.01 }, 500)
              .delay(index * 40)
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

          miniNebulaeRef.current = [];
          clickCountRef.current = 0;
          overloadCountRef.current = 0;

          setTimeout(() => {
            if (orbitGroupRef.current && activeEffectRef.current === 'nebula') {
              orbitGroupRef.current.visible = true;
              orbitGroupRef.current.scale.set(0.5 * m, 0.5 * m, 0.5 * m);
            }
            setNebulaHint(`Core stabilized. ${actionWord} to synthesize [0/4]`);
          }, 850);
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
    window.addEventListener('click', handleClick);
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
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

    requestAnimationFrame(() => { container.style.opacity = '1'; });
    container.style.pointerEvents = openMyWork ? 'none' : 'auto';

    if (openAboutme) {
      material.wireframe = true; material1.wireframe = true;
      ico.visible = true; icoLines.visible = true; orbitGroup.visible = false;
       
      new TWEEN.Tween(ico.position).to({ x: -1 }, 500).easing(TWEEN.Easing.Quadratic.Out).start();
      new TWEEN.Tween(icoLines.position).to({ x: -1 }, 500).easing(TWEEN.Easing.Quadratic.Out).start();
      new TWEEN.Tween(camera.position).to({ z: 1 }, 500).easing(TWEEN.Easing.Quadratic.Out).start();
      setActiveEffect('core');
    } else if (openMyWork) {
      ico.visible = false; icoLines.visible = false; orbitGroup.visible = false; 
      setActiveEffect('core');
    } else if (openFirst) {
      material.wireframe = false; material1.wireframe = false;
      ico.visible = true; icoLines.visible = true; orbitGroup.visible = true;

      new TWEEN.Tween(ico.position).to({ x: 0 }, 500).easing(TWEEN.Easing.Quadratic.Out).start();
      new TWEEN.Tween(icoLines.position).to({ x: 0 }, 500).easing(TWEEN.Easing.Quadratic.Out).start();
      new TWEEN.Tween(camera.position).to({ z: 2 }, 500).easing(TWEEN.Easing.Quadratic.Out).start();
    }
     
    material.needsUpdate = true; material1.needsUpdate = true;
  }, [openAboutme, openMyWork, openFirst]);

  useEffect(() => {
    const { ico, icoLines, orbitGroup, nucleiGroup } = { 
      ico: icoRef.current, icoLines: icoLinesRef.current, orbitGroup: orbitGroupRef.current, nucleiGroup: nucleiGroupRef.current 
    };
     
    if (!ico || !icoLines || !orbitGroup || !nucleiGroup) return;

    const duration = 1200;
    const isMobile = window.innerWidth <= 767.98;
    const m = isMobile ? 0.6 : 1; // 60% reducere pe mobil

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
      targetSpeedRef.current = 0.15;
      new TWEEN.Tween(ico.scale).to({ x: 1.25 * m, y: 1.25 * m, z: 1.25 * m }, duration).easing(TWEEN.Easing.Cubic.Out).start();
      new TWEEN.Tween(icoLines.scale).to({ x: 1.35 * m, y: 1.35 * m, z: 1.35 * m }, duration).easing(TWEEN.Easing.Cubic.Out).start();
      new TWEEN.Tween(orbitGroup.scale).to({ x: 0.5 * m, y: 0.5 * m, z: 0.5 * m }, duration).easing(TWEEN.Easing.Cubic.Out).start();
      new TWEEN.Tween(nucleiGroup.scale).to({ x: 0, y: 0, z: 0 }, duration).easing(TWEEN.Easing.Cubic.Out).start();
    }

  }, [activeEffect]);

  return (
    <>
      <div 
        ref={containerRef} 
        className='home_container_cont'
      ></div>

      <div className={`canvas_effects_controls ${openFirst ? 'visible' : 'hidden'}`}>
        <button 
          className={activeEffect === 'core' ? 'active' : ''} 
          onClick={() => setActiveEffect('core')}
        >
          CORE
        </button>
        <button 
          className={activeEffect === 'quantum' ? 'active' : ''} 
          onClick={() => setActiveEffect('quantum')}
        >
          QUANTUM
        </button>
        <button 
          className={activeEffect === 'nebula' ? 'active' : ''} 
          onClick={() => setActiveEffect('nebula')}
        >
          NEBULA
        </button>
      </div>

        {activeEffect === 'nebula' && openFirst && nebulaHint && (
          <div className="nebula_hud_hint">
            {nebulaHint}
          </div>
         )}
    </>
  );
}

export default HomeCanvas;