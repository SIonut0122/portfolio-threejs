import React, { useState, useEffect } from 'react';

function ScrollIndicator() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 150) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  return (
    <div className="csmright_dmore_wrp" style={{ opacity: 1 }}>
      <div className="tech-octagon">
        <div className="rotating-ring"></div>
        
        <div className={`arrow-container ${isScrolled ? 'point-up' : 'point-down'}`}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M12 20L12 4M12 4L6 10M12 4L18 10" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="square" 
              strokeLinejoin="miter"
            />
          </svg>
        </div>
        
        <div className="crosshair-corners"></div>
      </div>
    </div>
  );
}

export default ScrollIndicator;