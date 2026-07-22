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
  
  const audioRef = useRef(null);
  const wasPlayingBeforeHideRef = useRef(false);
  const sfxStateBeforeHideRef = useRef(false);
  const wasPlayingBeforeAutoMuteRef = useRef(false);

  const isMutedRef = useRef(isMuted);
  isMutedRef.current = isMuted;

  const isSfxMutedRef = useRef(isSfxMuted);
  isSfxMutedRef.current = isSfxMuted;

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
    playClickSound();
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
    playClickSound();
    const newState = !isSfxMuted;
    setIsSfxMuted(newState);
    setSFXMuted(newState);
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
      // Restaurează muzica doar dacă era pornită înainte de auto-mute ȘI utilizatorul nu a setat manual audio pe OFF în acest timp
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

          <div className="audio-controls-wrapper">
            <button className="audio-control-btn" onClick={toggleAudio} type="button">
              {isMuted ? '[ AUDIO: OFF ]' : '[ AUDIO: ON ]'}
            </button>
            <button className="audio-control-btn" onClick={toggleSFX} type="button">
              {isSfxMuted ? '[ SFX: OFF ]' : '[ SFX: ON ]'}
            </button>
          </div>
          <HomeCanvas />
          <Content />
            
        </MainContext.Provider>
      </div>
    </>
  );
}

export default Home;