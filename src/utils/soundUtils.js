import ambientAudioFile from '../assets/audio/ambient_bg.mp3';
import clickAudioFile from '../assets/audio/el_click.mp3';
import coreTransitionAudioFile from '../assets/audio/core_transition.mp3';
import windSpaceNebulaAudioFile from '../assets/audio/wind_space_nebula.mp3';
import materializeAudioFile from '../assets/audio/materialize.mp3';
import nebulaCoreDangerAudioFile from '../assets/audio/nebula_core_danger.mp3';
import nebulaExplosionAudioFile from '../assets/audio/nebula_explosion.mp3';
import coolingDownAudioFile from '../assets/audio/cooling_down.mp3';
import projectTransitionAudioFile from '../assets/audio/project_transition.mp3';
import projectSelectedAudioFile from '../assets/audio/project_selected.mp3';
import spaceBackgroundAudioFile from '../assets/audio/space_background_sfx.mp3';
import structuralStrainAudioFile from '../assets/audio/structural_strain.mp3';
import fusionAudioFile from '../assets/audio/fusion.mp3';

let audioCtx = null;
let masterGain = null;
const audioBuffers = {};
const loopingSources = {};

let sfxMuted = false;
let ambientMuted = true;
let wasAmbientPlayingBeforeAutoMute = false;
let lastClickTime = 0;

const getAudioContext = () => {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
      masterGain = audioCtx.createGain();
      masterGain.connect(audioCtx.destination);
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

const loadBuffer = async (url) => {
  if (audioBuffers[url]) return audioBuffers[url];
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const ctx = getAudioContext();
    if (!ctx) return null;
    const decoded = await ctx.decodeAudioData(arrayBuffer);
    audioBuffers[url] = decoded;
    return decoded;
  } catch (e) {
    return null;
  }
};

const playBufferSound = async (url, volume = 1, loop = false, key = null) => {
  const ctx = getAudioContext();
  if (!ctx) return null;

  const buffer = await loadBuffer(url);
  if (!buffer) return null;

  if (key && loopingSources[key]) {
    try {
      loopingSources[key].source.stop();
    } catch (e) {}
    delete loopingSources[key];
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = loop;

  const gainNode = ctx.createGain();
  gainNode.gain.value = volume;

  source.connect(gainNode);
  gainNode.connect(masterGain);

  source.start(0);

  if (key) {
    loopingSources[key] = { source, gainNode, volume };
  }

  return { source, gainNode };
};

export const playAmbientSound = (volume = 0.05) => {
  const vol = ambientMuted ? 0 : volume;
  playBufferSound(ambientAudioFile, vol, true, 'ambient');
};


export const stopAmbientSound = () => {
  if (loopingSources['ambient']) {
    try {
      loopingSources['ambient'].source.stop();
    } catch (e) {}
    delete loopingSources['ambient'];
  }
};

export const setAmbientMuted = (isMuted, volume = 0.05) => {
  ambientMuted = isMuted;
  if (loopingSources['ambient']) {
    loopingSources['ambient'].gainNode.gain.value = isMuted ? 0 : volume;
  } else if (!isMuted) {
    playAmbientSound(volume);
  }
};

export const muteBackgroundAudioSound = () => {
  if (loopingSources['ambient']) {
    wasAmbientPlayingBeforeAutoMute = !ambientMuted;
    stopAmbientSound();
  } else {
    wasAmbientPlayingBeforeAutoMute = false;
  }
};

export const restoreBackgroundAudioSound = () => {
  if (wasAmbientPlayingBeforeAutoMute && !ambientMuted) {
    playAmbientSound(0.05);
  }
  wasAmbientPlayingBeforeAutoMute = false;
};

// --- SFX Management ---

export const setSFXMuted = (isMuted) => {
  sfxMuted = isMuted;
  if (loopingSources['nebula']) {
    loopingSources['nebula'].gainNode.gain.value = isMuted ? 0 : loopingSources['nebula'].volume;
  }
  if (loopingSources['danger']) {
    loopingSources['danger'].gainNode.gain.value = isMuted ? 0 : loopingSources['danger'].volume;
  }
  if (loopingSources['spaceBg']) {
    loopingSources['spaceBg'].gainNode.gain.value = isMuted ? 0 : loopingSources['spaceBg'].volume;
  }
  if (loopingSources['strain']) {
    loopingSources['strain'].gainNode.gain.value = isMuted ? 0 : loopingSources['strain'].volume;
  }
  if (loopingSources['fusion']) {
    loopingSources['fusion'].gainNode.gain.value = isMuted ? 0 : loopingSources['fusion'].volume;
  }
};

export const playClickSound = (forcePlay = false) => {
  if (sfxMuted && !forcePlay) return;
  const now = Date.now();
  if (now - lastClickTime < 60) return;
  lastClickTime = now;
  playBufferSound(clickAudioFile, 0.03);
};

export const playProjectSelectedSound = (volume = 0.12) => {
  if (sfxMuted) return;
  playBufferSound(projectSelectedAudioFile, volume);
};

export const playProjectTransitionSound = (volume = 0.15) => {
  if (sfxMuted) return;
  playBufferSound(projectTransitionAudioFile, volume);
};

export const playCoreTransitionSound = () => {
  if (sfxMuted) return;
  playBufferSound(coreTransitionAudioFile, 0.15);
};

export const playWindNebulaSound = () => {
  const vol = sfxMuted ? 0 : 0.3;
  playBufferSound(windSpaceNebulaAudioFile, vol, true, 'nebula');
};

export const stopWindNebulaSound = () => {
  if (loopingSources['nebula']) {
    try {
      loopingSources['nebula'].source.stop();
    } catch (e) {}
    delete loopingSources['nebula'];
  }
};

export const playMaterializeSound = () => {
  if (sfxMuted) return;
  playBufferSound(materializeAudioFile, 0.05);
};

export const playDangerSound = (volume = 0.3) => {
  const vol = sfxMuted ? 0 : volume;
  playBufferSound(nebulaCoreDangerAudioFile, vol, true, 'danger');
};

export const updateDangerVolume = (volume) => {
  if (loopingSources['danger']) {
    loopingSources['danger'].volume = volume;
    if (!sfxMuted) {
      loopingSources['danger'].gainNode.gain.value = volume;
    }
  }
};

export const stopDangerSound = () => {
  if (loopingSources['danger']) {
    try {
      loopingSources['danger'].source.stop();
    } catch (e) {}
    delete loopingSources['danger'];
  }
};

export const playExplosionSound = () => {
  if (sfxMuted) return;
  playBufferSound(nebulaExplosionAudioFile, 0.5);
};

export const playCoolingDownSound = () => {
  if (sfxMuted) return;
  playBufferSound(coolingDownAudioFile, 0.5);
};

export const playSpaceBackgroundSound = (volume) => {
  const vol = sfxMuted ? 0 : volume;
  playBufferSound(spaceBackgroundAudioFile, vol, true, 'spaceBg');
};

export const stopSpaceBackgroundSound = () => {
  if (loopingSources['spaceBg']) {
    try {
      loopingSources['spaceBg'].source.stop();
    } catch (e) {}
    delete loopingSources['spaceBg'];
  }
};

export const fadeOutSpaceBackgroundSound = (duration = 2000) => {
  const item = loopingSources['spaceBg'];
  if (!item || !audioCtx) return;

  const currentVol = item.gainNode.gain.value;
  item.gainNode.gain.setValueAtTime(currentVol, audioCtx.currentTime);
  item.gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + duration / 1000);

  setTimeout(() => {
    stopSpaceBackgroundSound();
  }, duration);
};

export const playStructuralStrainSound = (volume = 0.1) => {
  const vol = sfxMuted ? 0 : volume;
  playBufferSound(structuralStrainAudioFile, vol, true, 'strain');
};

export const stopStructuralStrainSound = () => {
  if (loopingSources['strain']) {
    try {
      loopingSources['strain'].source.stop();
    } catch (e) {}
    delete loopingSources['strain'];
  }
};

export const playFusionSound = (volume = 0.09) => {
  const vol = sfxMuted ? 0 : volume;
  playBufferSound(fusionAudioFile, vol, true, 'fusion');
};

export const stopFusionSound = () => {
  if (loopingSources['fusion']) {
    try {
      loopingSources['fusion'].source.stop();
    } catch (e) {}
    delete loopingSources['fusion'];
  }
};