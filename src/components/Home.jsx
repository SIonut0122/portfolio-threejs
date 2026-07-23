import React, { useState, useEffect, useRef } from "react";
import HomeCanvas from "./Home_canvas";
import Content from './Content';
import Header from './Header';
import ambientAudioFile from '../assets/audio/ambient_bg.mp3';
import { setSFXMuted, playClickSound } from '../utils/soundUtils';

export const MainContext = React.createContext();

function Home() {
  const [canvasIsVisible, setCanvasIsVisible] = useState(true);
  const [wireFrameOn, setWireFrameOn] = useState(false);
  const [openAboutme, setOpenAboutme] = useState(false);
  const [openMyWork, setOpenMyWork] = useState(false);
  const [openFirst, setOpenFirst] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isSfxMuted, setIsSfxMuted] = useState(false); 
  const [isMobileAudioOpen, setIsMobileAudioOpen] = useState(false);
  
  const audioRef = useRef(null);
  const audioWrapperRef = useRef(null);
  const wasPlayingBeforeHideRef = useRef(false);
  const sfxStateBeforeHideRef = useRef(false);
  const wasPlayingBeforeAutoMuteRef = useRef(false);

  const isMutedRef = useRef(isMuted);
  isMutedRef.current = isMuted;

  const isSfxMutedRef = useRef(isSfxMuted);
  isSfxMutedRef.current = isSfxMuted;

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
    audioRef.current = new Audio(ambientAudioFile);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.05;
    document.title = '] HOME [ Ionut Stan - Front-End Developer';

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (audioRef.current && !isMutedRef.current) {
          wasPlayingBeforeHideRef.current = true;
          audioRef.current.pause();
        } else {
          wasPlayingBeforeHideRef.current = false;
        }

        sfxStateBeforeHideRef.current = isSfxMutedRef.current;
        if (!isSfxMutedRef.current) {
          setSFXMuted(true);
        }
      } else {
        if (wasPlayingBeforeHideRef.current && audioRef.current && !isMutedRef.current) {
          audioRef.current.play().catch(err => console.log(err));
          wasPlayingBeforeHideRef.current = false;
        }

        if (!sfxStateBeforeHideRef.current) {
          setSFXMuted(false);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      document.title = 'Ionut Stan - Front-End Developer';
    };
  }, []);

  const toggleAudio = () => {
    playClickSound(true);
    if (!audioRef.current) return;
    
    if (isMuted) {
      audioRef.current.play().catch(err => console.log(err));
      setIsMuted(false);
    } else {
      audioRef.current.pause();
      setIsMuted(true);
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
    if (audioRef.current) {
      wasPlayingBeforeAutoMuteRef.current = !isMutedRef.current;
      if (!isMutedRef.current) {
        audioRef.current.pause();
      }
    }
  };

  const restoreBackgroundAudio = () => {
    if (audioRef.current) {
      if (wasPlayingBeforeAutoMuteRef.current && !isMutedRef.current) {
        audioRef.current.play().catch(err => console.log(err));
      }
      wasPlayingBeforeAutoMuteRef.current = false;
    }
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