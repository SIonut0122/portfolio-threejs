import React, { useState, useEffect, useRef } from "react";
import HomeCanvas from "./Home_canvas";
import Content from './Content';
import Header from './Header';
import isLogo from '../assets/images/is-logo.png';
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
  const [initPhase, setInitPhase] = useState('waiting');
  const [initProgress, setInitProgress] = useState(0);
  
  const [canvasIsVisible, setCanvasIsVisible] = useState(true);
  const [wireFrameOn, setWireFrameOn] = useState(false);
  const [openAboutme, setOpenAboutme] = useState(false);
  const [openMyWork, setOpenMyWork] = useState(false);
  const [openFirst, setOpenFirst] = useState(false);
  const [showHomeContent, setShowHomeContent] = useState(false);
  
  const [isMuted, setIsMuted] = useState(true);
  const [isSfxMuted, setIsSfxMuted] = useState(false); 
  const [isMobileAudioOpen, setIsMobileAudioOpen] = useState(false);
  
  const audioWrapperRef = useRef(null);
  const wasPlayingBeforeHideRef = useRef(false);
  const sfxStateBeforeHideRef5 = useRef(false);

  const reqRef = useRef(null);
  const holdStartTime = useRef(0);
  const HOLD_DURATION = 2300;

  const initPhaseRef = useRef(initPhase);
  initPhaseRef.current = initPhase;

  const isMutedRef = useRef(isMuted);
  isMutedRef.current = isMuted;

  const isSfxMutedRef = useRef(isSfxMuted);
  isSfxMutedRef.current = isSfxMuted;

  const handleLoadingComplete = () => {
    setOpenFirst(true);
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    if (['fadingContent', 'fadingBg', 'complete'].includes(initPhaseRef.current)) return;
    
    setInitPhase('holding');
    playClickSound();
    holdStartTime.current = performance.now();
    
    const updateProgress = (currentTime) => {
      const elapsed = currentTime - holdStartTime.current;
      const p = Math.min((elapsed / HOLD_DURATION) * 100, 100);
      setInitProgress(p);

      if (p < 100) {
        reqRef.current = requestAnimationFrame(updateProgress);
      } else {
        setInitPhase('ready');
      }
    };
    reqRef.current = requestAnimationFrame(updateProgress);
  };

  useEffect(() => {
    const handleGlobalPointerUp = () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
      
      const currentPhase = initPhaseRef.current;
      
      if (currentPhase === 'ready') {
        setInitPhase('fadingContent');
        playClickSound();
        
        setTimeout(() => {
          setInitPhase('fadingBg');
          
          setTimeout(() => {
            setInitPhase('complete');
            handleLoadingComplete();
          }, 650); 
        }, 400); 
      } else if (currentPhase === 'holding') {
        setInitPhase('waiting');
        setInitProgress(0);
      }
    };

    window.addEventListener('pointerup', handleGlobalPointerUp);
    return () => {
      window.removeEventListener('pointerup', handleGlobalPointerUp);
    };
  }, []);

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
          setAmbientMuted(true, ambientVolume);
        } else {
          wasPlayingBeforeHideRef.current = false;
        }

        sfxStateBeforeHideRef5.current = isSfxMutedRef.current;
        if (!isSfxMutedRef.current) {
          setSFXMuted(true);
        }
      } else {
        if (wasPlayingBeforeHideRef.current && !isMutedRef.current) {
          setAmbientMuted(false, ambientVolume);
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

  const isReadyState = ['ready', 'fadingContent', 'fadingBg'].includes(initPhase);
  const isContentFading = ['fadingContent', 'fadingBg'].includes(initPhase);

  useEffect(() => {
    const isMobile = window.innerWidth <= 767.98;
    if (isReadyState && !isMobile && initPhase !== 'complete') {
      document.body.classList.add('gatekeeper-ready-cursor');
    } else {
      document.body.classList.remove('gatekeeper-ready-cursor');
    }

    return () => {
      document.body.classList.remove('gatekeeper-ready-cursor');
    };
  }, [isReadyState, initPhase]);

  return (
    <>
      <div className='home_container_full w-100'>
        {initPhase !== 'complete' && (
          <div className={`loading_gatekeeper ${initPhase === 'fadingBg' ? 'fade-out' : ''}`}>
            <div className="gatekeeper_decorative_grid"></div>
            
            <div className="gatekeeper_header_mock">
              <div className="header-logo">
                <img src={isLogo} alt="Logo" />
              </div>
            </div>

            <div className={`gatekeeper_content ${isContentFading ? 'content-fade-out' : ''}`}>
              <div className={`init_status_text ${isReadyState ? 'ready-text' : ''}`}>
                {isReadyState ? 'RELEASE TO PROCEED' : `Core initialization: ${Math.floor(initProgress)}%`}
              </div>

              <button 
                className={`init_btn ${isReadyState ? 'is-ready' : ''}`}
                onPointerDown={handlePointerDown}
                onContextMenu={(e) => e.preventDefault()}
              >
                <div className="init_btn_bg" style={{ width: `${initProgress}%` }}></div>
                <span className="btn_bracket">[</span>
                <span className="btn_text">
                  {isReadyState ? 'CORE READY' : 'HOLD TO INITIALIZE'}
                </span>
                <span className="btn_bracket">]</span>
              </button>

              <p className="subtext">Desktop recommended for best experience</p>
            </div>
          </div>
        )}

        <MainContext.Provider value={{  
            canvasIsVisible, setCanvasIsVisible,
            wireFrameOn, setWireFrameOn,
            openAboutme, setOpenAboutme,
            openMyWork, setOpenMyWork,
            openFirst, setOpenFirst,
            showHomeContent, setShowHomeContent,
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
          {showHomeContent && <Content />}
            
        </MainContext.Provider>
      </div>
    </>
  );
}

export default Home;