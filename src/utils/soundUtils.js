import clickAudioFile from '../assets/audio/el_click.mp3';
import coreTransitionAudioFile from '../assets/audio/core_transition.mp3';
import windSpaceNebulaAudioFile from '../assets/audio/wind_space_nebula.mp3';
import materializeAudioFile from '../assets/audio/materialize.mp3';
import nebulaCoreDangerAudioFile from '../assets/audio/nebula_core_danger.mp3';
import nebulaExplosionAudioFile from '../assets/audio/nebula_explosion.mp3';

let nebulaAudioInstance = null;
let dangerAudioInstance = null;

let sfxMuted = false;

export const setSFXMuted = (isMuted) => {
  sfxMuted = isMuted;
  if (nebulaAudioInstance) nebulaAudioInstance.muted = isMuted;
  if (dangerAudioInstance) dangerAudioInstance.muted = isMuted;
};

export const playClickSound = () => {
  if (sfxMuted) return;
  const clickAudio = new Audio(clickAudioFile);
  clickAudio.volume = 0.05;
  clickAudio.play().catch(err => console.log(err));
};

export const playCoreTransitionSound = () => {
  if (sfxMuted) return;
  const transitionAudio = new Audio(coreTransitionAudioFile);
  transitionAudio.volume = 0.2;
  transitionAudio.play().catch(err => console.log(err));
};

export const playWindNebulaSound = () => {
  if (!nebulaAudioInstance) {
    nebulaAudioInstance = new Audio(windSpaceNebulaAudioFile);
    nebulaAudioInstance.volume = 0.4;
    nebulaAudioInstance.loop = true;
  }
  nebulaAudioInstance.muted = sfxMuted;
  nebulaAudioInstance.currentTime = 0;
  nebulaAudioInstance.play().catch(err => console.log(err));
};

export const stopWindNebulaSound = () => {
  if (nebulaAudioInstance) {
    nebulaAudioInstance.pause();
    nebulaAudioInstance.currentTime = 0;
  }
};

export const playMaterializeSound = () => {
  if (sfxMuted) return;
  const materializeAudio = new Audio(materializeAudioFile);
  materializeAudio.volume = 0.05;
  materializeAudio.play().catch(err => console.log(err));
};

export const playDangerSound = (volume = 0.3) => {
  if (!dangerAudioInstance) {
    dangerAudioInstance = new Audio(nebulaCoreDangerAudioFile);
    dangerAudioInstance.loop = true;
  }
  dangerAudioInstance.volume = volume;
  dangerAudioInstance.muted = sfxMuted;
  dangerAudioInstance.currentTime = 0;
  dangerAudioInstance.play().catch(err => console.log(err));
};

export const updateDangerVolume = (volume) => {
  if (dangerAudioInstance) {
    dangerAudioInstance.volume = volume;
  }
};

export const stopDangerSound = () => {
  if (dangerAudioInstance) {
    dangerAudioInstance.pause();
    dangerAudioInstance.currentTime = 0;
  }
};

export const playExplosionSound = () => {
  if (sfxMuted) return;
  const explosionAudio = new Audio(nebulaExplosionAudioFile);
  explosionAudio.volume = 0.7;
  explosionAudio.play().catch(err => console.log(err));
};