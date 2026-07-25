import React, { useState, useEffect, useRef } from 'react';
import { 
  playClickSound, 
  playSpaceBackgroundSound, 
  stopSpaceBackgroundSound, 
  fadeOutSpaceBackgroundSound,
  playStructuralStrainSound,
  stopStructuralStrainSound,
  playFusionSound,
  stopFusionSound
} from '../utils/soundUtils';
import isLogo from '../assets/images/is-logo.png';

const playChargeSound = () => {};
const playSupernovaSound = () => {};

const LoadingScreen = ({ onComplete }) => {
  const [phase, setPhase] = useState('gatekeeper'); 
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const progressTextRef = useRef(null);
  const requestRef = useRef();
  const isMobile = window.innerWidth <= 767.98;

  const startSequence = () => {
    playClickSound();
    playChargeSound();
    playSpaceBackgroundSound(0.1);
    setPhase('loading');
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.code === 'Space' || e.key === ' ') && phase === 'gatekeeper') {
        e.preventDefault();
        startSequence();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'loading') return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = window.innerWidth;
    let height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    
    ctx.scale(dpr, dpr);

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };
    window.addEventListener('resize', handleResize);

    const particles = [];
    const numParticles = width < 768 ? 400 : 900;
    
    for (let i = 0; i < numParticles; i++) {
      const shade = Math.floor(Math.random() * 180 + 75);
      particles.push({
        angle: Math.random() * Math.PI * 2,
        radius: Math.random() * Math.max(width, height) * 0.8,
        speed: Math.random() * 0.02 + 0.005,
        size: Math.random() * 2 + 0.5,
        color: `rgba(${shade}, ${shade}, ${shade}, ${Math.random() * 0.5 + 0.2})`,
        driftX: 0
      });
    }

    let startTime = null;
    let strainSoundStarted = false;
    let trembleSoundPlayed = false;
    let explosionSoundPlayed = false;
    let isFadingOut = false;

    const render = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      ctx.fillStyle = 'rgba(10, 10, 10, 0.3)';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      if (elapsed < 1500) {
        const currentProgress = Math.floor((elapsed / 7500) * 100);
        
        if (progressTextRef.current) {
          progressTextRef.current.innerText = `[ SYSTEM_BOOT: ${currentProgress.toString().padStart(3, '0')}% ]`;
        }

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.driftX += 0.12;
          
          const px = cx + Math.cos(p.angle) * p.radius + p.driftX;
          const py = cy + Math.sin(p.angle) * p.radius;
          
          ctx.beginPath();
          ctx.arc(px, py, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        }

        const pulse = Math.sin(timestamp * 0.005) * 3;
        const coreRadius = 45 + pulse;
        
        ctx.beginPath();
        ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#000000';
        ctx.shadowBlur = 35 + pulse * 2;
        ctx.shadowColor = 'rgba(0, 255, 170, 0.3)';
        ctx.fill();
        ctx.shadowBlur = 0;
      } 
      else if (elapsed < 4500) {
        if (!strainSoundStarted) {
          playStructuralStrainSound(0.1);
          strainSoundStarted = true;
        }

        const shakeIntensity = 3;
        const offsetX = (Math.random() - 0.5) * shakeIntensity;
        const offsetY = (Math.random() - 0.5) * shakeIntensity;
        ctx.translate(offsetX, offsetY);

        const attractElapsed = elapsed - 1500;
        const attractRatio = attractElapsed / 3000;
        const currentProgress = Math.floor(20 + attractRatio * 50);

        if (progressTextRef.current) {
          progressTextRef.current.innerText = `[ SYSTEM_BOOT: ${currentProgress.toString().padStart(3, '0')}% ]`;
        }

        const coreRadius = 45;
        const powerFactor = Math.pow(attractRatio, 4) * 60 + 0.5;

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.angle += p.speed * (1 + attractRatio * 5);
          p.radius -= powerFactor;
          p.driftX *= 0.95;

          if (p.radius > coreRadius) {
            const px = cx + Math.cos(p.angle) * p.radius + p.driftX;
            const py = cy + Math.sin(p.angle) * p.radius;
            
            ctx.beginPath();
            ctx.arc(px, py, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
          }
        }

        ctx.beginPath();
        ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#000000';
        ctx.shadowBlur = 35;
        ctx.shadowColor = 'rgba(0, 255, 170, 0.3)';
        ctx.fill();
        ctx.shadowBlur = 0;
      } 
      else if (elapsed < 7500) {
        stopStructuralStrainSound();

        const subElapsed = elapsed - 4500; 
        const shrinkProgress = subElapsed / 3000; 

        if (!trembleSoundPlayed && subElapsed >= 1000) {
          playFusionSound(0.1);
          trembleSoundPlayed = true;
        }

        let coreRadius = 45 - (shrinkProgress * 33);
        let trembleIntensity = shrinkProgress * 16;

        const currentProgress = Math.min(100, Math.floor(70 + shrinkProgress * 30));
        if (progressTextRef.current) {
          progressTextRef.current.innerText = `[ CRITICAL_MASS: ${currentProgress}% ]`;
          if (subElapsed > 1500) {
            progressTextRef.current.classList.add('glitch-text');
          }
        }

        const tx = cx + (Math.random() - 0.5) * trembleIntensity;
        const ty = cy + (Math.random() - 0.5) * trembleIntensity;

        ctx.beginPath();
        ctx.arc(tx, ty, Math.max(8, coreRadius), 0, Math.PI * 2);
        ctx.fillStyle = '#000000';
        ctx.shadowBlur = 45 + (1 - shrinkProgress) * 25;
        ctx.shadowColor = 'rgba(0, 255, 170, 0.6)';
        ctx.fill();
        ctx.shadowBlur = 0;
      } 
      else if (elapsed < 9500) {
        stopStructuralStrainSound();
        stopFusionSound();

        if (!explosionSoundPlayed) {
          playSupernovaSound();
          explosionSoundPlayed = true;
          if (progressTextRef.current) {
            progressTextRef.current.style.display = 'none';
          }
        }

        if (!isFadingOut && elapsed > 8000 && containerRef.current) {
          isFadingOut = true;
          containerRef.current.style.opacity = '0';
          fadeOutSpaceBackgroundSound(2000);
        }

        const expElapsed = elapsed - 7500;
        const expRatio = expElapsed / 2000;

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.radius += 12 + (expRatio * 15);

          const px = cx + Math.cos(p.angle) * p.radius;
          const py = cy + Math.sin(p.angle) * p.radius;
          
          ctx.beginPath();
          ctx.arc(px, py, Math.max(0, p.size * (1 - expRatio)), 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        }

        if (expRatio < 0.6) {
          const shockRatio = expRatio / 0.6;
          ctx.beginPath();
          ctx.arc(cx, cy, shockRatio * Math.max(width, height) * 0.8, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(0, 255, 170, ${0.4 * (1 - shockRatio)})`;
          ctx.lineWidth = 3 * (1 - shockRatio);
          ctx.stroke();
        }
      } 
      else {
        stopStructuralStrainSound();
        stopFusionSound();
        stopSpaceBackgroundSound();
        if (onComplete) onComplete();
        return;
      }

      requestRef.current = requestAnimationFrame(render);
    };

    requestRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      stopStructuralStrainSound();
      stopFusionSound();
      stopSpaceBackgroundSound();
    };
  }, [phase, onComplete]);

  if (phase === 'gatekeeper') {
    return (
      <div className="loading_gatekeeper">
        <div className="gatekeeper_header_mock">
          <div className="header-logo">
            <img src={isLogo} alt="Logo" />
          </div>
        </div>

        <div className="gatekeeper_content">
          <div className="gatekeeper_decorative_grid"></div>
          
          <button className="init_btn" onClick={startSequence}>
            <span className="btn_bracket">[</span>
            <span className="btn_text">INITIALIZE CORE</span>
            <span className="btn_bracket">]</span>
          </button>

          {isMobile ? (
            <p className="subtext">Desktop recommended for best experience</p>
          ) : (
            <p className="subtext">PRESS SPACE / CLICK</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="loading_canvas_container"
      style={{ 
        backgroundColor: '#0a0a0a', 
        transition: 'opacity 3.0s cubic-bezier(0.25, 1, 0.5, 1)' 
      }}
    >
      <canvas ref={canvasRef} className="collapse_canvas" />
      <div ref={progressTextRef} className="collapse_progress_text">
        [ SYSTEM_BOOT: 000% ]
      </div>
    </div>
  );
};

export default LoadingScreen;