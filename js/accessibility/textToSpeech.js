/**
 * Lecture vocale (Web Speech API) pour le panneau accessibilité.
 */

import {
  DEFAULT_VOICE_PROFILE,
  normalizeVoiceProfile,
  resolveVoiceForProfile,
} from './ttsVoiceProfiles.js';

const RATE_PRESETS = {
  verySlow: 0.6,
  slow: 0.8,
  normal: 1,
  fast: 1.2,
};

/**
 * @returns {import('./textToSpeech.js').TextToSpeechController}
 */
export function createTextToSpeech() {
  /** @type {SpeechSynthesisUtterance | null} */
  let utterance = null;
  /** @type {'idle'|'speaking'|'paused'} */
  let state = 'idle';
  let rateKey = 'normal';
  let voiceProfile = DEFAULT_VOICE_PROFILE;
  /** @type {SpeechSynthesisVoice[]} */
  let voices = [];
  const listeners = new Set();

  const notify = () => listeners.forEach((fn) => fn());

  const loadVoices = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    voices = window.speechSynthesis.getVoices();
    notify();
  };

  if (typeof window !== 'undefined' && window.speechSynthesis) {
    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
  }

  const supported = () =>
    typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

  const stop = () => {
    if (!supported()) return;
    window.speechSynthesis.cancel();
    utterance = null;
    state = 'idle';
    notify();
  };

  const pause = () => {
    if (!supported() || state !== 'speaking') return;
    window.speechSynthesis.pause();
    state = 'paused';
    notify();
  };

  const resume = () => {
    if (!supported() || state !== 'paused') return;
    window.speechSynthesis.resume();
    state = 'speaking';
    notify();
  };

  const speak = (text) => {
    if (!supported() || !text?.trim()) return;
    stop();

    utterance = new SpeechSynthesisUtterance(text.trim());
    utterance.rate = RATE_PRESETS[rateKey] ?? 1;
    utterance.lang = 'fr-FR';

    const voice = resolveVoiceForProfile(voices, voiceProfile);
    if (voice) utterance.voice = voice;

    utterance.onend = () => {
      state = 'idle';
      utterance = null;
      notify();
    };
    utterance.onerror = () => {
      state = 'idle';
      utterance = null;
      notify();
    };

    state = 'speaking';
    notify();
    window.speechSynthesis.speak(utterance);
  };

  const readSelection = () => {
    const sel = window.getSelection?.()?.toString()?.trim();
    if (sel) speak(sel);
    return Boolean(sel);
  };

  return {
    get supported() { return supported(); },
    get state() { return state; },
    get rateKey() { return rateKey; },
    get voiceProfile() { return voiceProfile; },
    get ratePresets() { return { ...RATE_PRESETS }; },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    speak,
    stop,
    pause,
    resume,
    readSelection,
    setRate(key) {
      if (!(key in RATE_PRESETS)) return;
      rateKey = key;
      notify();
    },
    setVoiceProfile(value) {
      voiceProfile = normalizeVoiceProfile(value);
      notify();
    },
    destroy() {
      stop();
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      }
    },
  };
}

/** @typedef {ReturnType<typeof createTextToSpeech>} TextToSpeechController */
