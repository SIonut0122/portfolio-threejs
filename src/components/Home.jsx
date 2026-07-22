import React, { useState, useEffect, useRef } from "react";
import HomeCanvas from "./Home_canvas";
import Content from './Content';
import Header from './Header';
import ambientAudioFile from '../assets/audio/ambient_bg.mp3';
import { setSFXMuted } from '../utils/soundUtils';

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
  const wasMusicPlayingRef = useRef(false);

  useEffect(() => {
    audioRef.current = new Audio(ambientAudioFile);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.05;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    
    if (isMuted) {
      audioRef.current.play().catch(err => console.log(err));
      setIsMuted(false);
      wasMusicPlayingRef.current = false;
    } else {
      audioRef.current.pause();
      setIsMuted(true);
      wasMusicPlayingRef.current = false;
    }
  };

  const toggleSFX = () => {
    const newState = !isSfxMuted;
    setIsSfxMuted(newState);
    setSFXMuted(newState);
  };

  const muteBackgroundAudio = () => {
    if (audioRef.current && !isMuted) {
      wasMusicPlayingRef.current = true;
      audioRef.current.pause();
      setIsMuted(true);
    } else {
      wasMusicPlayingRef.current = false;
    }
  };

  const restoreBackgroundAudio = () => {
    if (wasMusicPlayingRef.current && audioRef.current) {
      audioRef.current.play().catch(err => console.log(err));
      setIsMuted(false);
      wasMusicPlayingRef.current = false;
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

          <button className="d-none" id='whitefireframe' type='button'>White / wireframe</button>
          <button className="d-none" id='blackwhiteframe' type='button'>Black / wireframe</button>

          <HomeCanvas />
          <Content />
            
        </MainContext.Provider>
      </div>
    </>
  );
}

export default Home;