import { useEffect, useState } from 'react';
import isLogo from '../assets/images/is-logo.png';
import './Preloader.scss';

function Preloader({ onLoaded }) {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 15) + 5;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setTimeout(() => {
          setIsFadingOut(true);
          setTimeout(() => {
            if (onLoaded) onLoaded();
          }, 800);
        }, 300);
      }
      setProgress(currentProgress);
    }, 50);

    return () => clearInterval(interval);
  }, [onLoaded]);

  return (
    <div className={`global_preloader ${isFadingOut ? 'fade-out' : ''}`}>
      <div className="preloader_content">
        <img src={isLogo} alt="Logo" className="preloader_logo" />
        <div className="preloader_counter">{progress}%</div>
      </div>
    </div>
  );
}

export default Preloader;