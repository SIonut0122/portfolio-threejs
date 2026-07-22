import React, { useEffect, useState, useRef } from 'react';

const NebulaCursor = ({ isActive }) => {
  const cursorRef = useRef(null);
  const mousePosRef = useRef({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2
  });
  const [shockwaves, setShockwaves] = useState([]);

  useEffect(() => {
    if (!isActive) return;

    if (window.innerWidth > 767.98) {
      document.body.classList.add('nebula-cursor-active');
    }

    const isTouchDevice = window.innerWidth <= 767.98;

    const triggerShockwave = (x, y) => {
      const newWave = {
        id: Date.now() + Math.random(),
        x,
        y
      };

      setShockwaves((prev) => [...prev, newWave]);

      setTimeout(() => {
        setShockwaves((prev) => prev.filter((w) => w.id !== newWave.id));
      }, 600);
    };

    const handleMouseMove = (e) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };

      if (cursorRef.current && !isTouchDevice) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      }
    };

    const handleMouseDown = (e) => {
      const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);

      if (!clientX && !clientY) return;

      triggerShockwave(clientX, clientY);
    };

    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        triggerShockwave(mousePosRef.current.x, mousePosRef.current.y);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('touchstart', handleMouseDown, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.classList.remove('nebula-cursor-active');
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('touchstart', handleMouseDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="nebula-cursor-layer">
      <div ref={cursorRef} className="quantum-reticle">
        <div className="reticle-center"></div>
        <div className="reticle-ring"></div>
        <div className="reticle-bracket top-left"></div>
        <div className="reticle-bracket top-right"></div>
        <div className="reticle-bracket bottom-left"></div>
        <div className="reticle-bracket bottom-right"></div>
      </div>

      {shockwaves.map((wave) => (
        <div
          key={wave.id}
          className="quantum-click-shockwave"
          style={{ left: `${wave.x}px`, top: `${wave.y}px` }}
        />
      ))}
    </div>
  );
};

export default NebulaCursor;