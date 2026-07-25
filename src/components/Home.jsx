import React, { useState, useEffect, useRef } from "react";
import HomeCanvas from "./Home_canvas";
import Content from './Content';
import Header from './Header';
import LoadingScreen from './LoadingScreen';
import { 
  setSFXMuted, 
  playClickSound, 
  playAmbientSound, 
  stopAmbientSound, 
  setAmbientMuted, 
  muteBackgroundAudioSound, 
  restoreBackgroundAudioSound 
} from '../utils/soundUtils';

export const MainContext = React.createContext();

function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [canvasIsVisible, setCanvasIsVisible] = useState(true);
  const [wireFrameOn, setWireFrameOn] = useState(false);
  const [openAboutme, setOpenAboutme] = useState(false);
  const [openMyWork, setOpenMyWork] = useState(false);
  const [openFirst, setOpenFirst] = useState(false);
  
  const [isMuted, setIsMuted] = useState(false);
  const [isSfxMuted, setIsSfxMuted] = useState(false); 
  const [isMobileAudioOpen, setIsMobileAudioOpen] = useState(false);
  
  const audioWrapperRef = useRef(null);
  const wasPlayingBeforeHideRef = useRef(false);
  const sfxStateBeforeHideRef5 = useRef(false);

  const isMutedRef = useRef(isMuted);
  isMutedRef.current = isMuted;

  const isSfxMutedRef = useRef(isSfxMuted);
  isSfxMutedRef.current = isSfxMuted;

  const handleLoadingComplete = () => {
    setIsLoading(false);
    setOpenFirst(true);

    const isMobile = window.innerWidth <= 767.98;
    const ambientVolume = isMobile ? 0.015 : 0.05;
    setAmbientMuted(false, ambientVolume);
    playAmbientSound(ambientVolume);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (audioWrapperRef.current && !audioWrapperRef.current.contains(event.target)) {
        setIsMobileAudioOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    document.title = '] HOME [ Ionut Stan - Front-End Developer';

    const handleVisibilityChange = () => {
      const isMobile = window.innerWidth <= 767.98;
      const ambientVolume = isMobile ? 0.015 : 0.05;

      if (document.hidden) {
        if (!isMutedRef.current) {
          wasPlayingBeforeHideRef.current = true;
          stopAmbientSound();
        } else {
          wasPlayingBeforeHideRef.current = false;
        }

        sfxStateBeforeHideRef5.current = isSfxMutedRef.current;
        if (!isSfxMutedRef.current) {
          setSFXMuted(true);
        }
      } else {
        if (wasPlayingBeforeHideRef.current && !isMutedRef.current) {
          playAmbientSound(ambientVolume);
          wasPlayingBeforeHideRef.current = false;
        }

        if (!sfxStateBeforeHideRef5.current) {
          setSFXMuted(false);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopAmbientSound();
      document.title = 'Ionut Stan - Front-End Developer';
    };
  }, []);

  const toggleAudio = () => {
    playClickSound(true);
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    const isMobile = window.innerWidth <= 767.98;
    const ambientVolume = isMobile ? 0.015 : 0.05;

    setAmbientMuted(newMutedState, ambientVolume);
    if (!newMutedState) {
      playAmbientSound(ambientVolume);
    } else {
      stopAmbientSound();
    }
  };

  const toggleSFX = () => {
    playClickSound(true);
    const newState = !isSfxMuted;
    setIsSfxMuted(newState);
    setSFXMuted(newState);
  };

  const toggleMobileAudioMenu = () => {
    playClickSound(true);
    setIsMobileAudioOpen(!isMobileAudioOpen);
  };

  const muteBackgroundAudio = () => {
    muteBackgroundAudioSound();
  };

  const restoreBackgroundAudio = () => {
    restoreBackgroundAudioSound();
  };

  return (
    <>
      <div className='home_container_full w-100'>
        <MainContext.Provider value={{  
            canvasIsVisible, setCanvasIsVisible,
            wireFrameOn, setWireFrameOn,
            openAboutme, setOpenAboutme,
            openMyWork, setOpenMyWork,
            openFirst, setOpenFirst,
            muteBackgroundAudio,
            restoreBackgroundAudio
        }}>
          {isLoading && <LoadingScreen onComplete={handleLoadingComplete} />}

          <Header /> 

          <div ref={audioWrapperRef} className={`audio-controls-wrapper ${isMobileAudioOpen ? 'mobile-expanded' : ''}`}>
            <button className="mobile-audio-trigger" onClick={toggleMobileAudioMenu} aria-label="Toggle Audio HUD">
              <span className={`hud-dot ${(!isMuted || !isSfxMuted) ? 'active' : ''}`}></span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                {!isMuted && <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>}
              </svg>
            </button>
            
            <div className="audio-buttons-container">
              <button className={`audio-control-btn ${!isMuted ? 'active' : ''}`} onClick={toggleAudio} type="button">
                <span className="status-indicator"></span>
                <span className="btn-text">{isMuted ? 'AUDIO: OFF' : 'AUDIO: ON'}</span>
              </button>
              <button className={`audio-control-btn ${!isSfxMuted ? 'active' : ''}`} onClick={toggleSFX} type="button">
                <span className="status-indicator"></span>
                <span className="btn-text">{isSfxMuted ? 'SFX: OFF' : 'SFX: ON'}</span>
              </button>
            </div>
          </div>
          
          <HomeCanvas />
          <Content />
            
        </MainContext.Provider>
      </div>
    </>
  );
}

export default Home;