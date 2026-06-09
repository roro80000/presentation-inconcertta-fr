import {
  DEFAULT_A11Y_PREFS,
  getAccessibilityPrefs,
  setAccessibilityPrefs,
  isAnyA11yPrefEnabled,
  sanitizePrefs,
} from './accessibilityPrefs.js';
import { applyA11yEffects, A11Y_BODY_CLASSES, clearA11yVisualFilterEffects } from './applyA11yEffects.js';
import { applyA11yLiteracyEffects, clearA11yLiteracyEffects } from './applyA11yLiteracyEffects.js';
import { createTextToSpeech } from './textToSpeech.js';
import { initLocale, setLocale, getLocale } from './strings.js';

export function createAccessibilityStore() {
  const listeners = new Set();
  let prefs = getAccessibilityPrefs();
  const tts = createTextToSpeech();

  const notify = () => listeners.forEach((fn) => fn());

  const apply = () => {
    applyA11yEffects(prefs);
    applyA11yLiteracyEffects(prefs);
  };

  return {
    get prefs() { return prefs; },
    get tts() { return tts; },
    get isAnyEnabled() { return isAnyA11yPrefEnabled(prefs); },
    get locale() { return getLocale(); },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    apply,
    setPref(key, value) {
      prefs = sanitizePrefs({ ...prefs, [key]: value });
      setAccessibilityPrefs(prefs);
      apply();
      notify();
    },
    togglePref(key) {
      if (typeof prefs[key] !== 'boolean') return;
      if (key === 'ttsTopbar' && prefs[key]) tts.stop();
      prefs = sanitizePrefs({ ...prefs, [key]: !prefs[key] });
      setAccessibilityPrefs(prefs);
      apply();
      notify();
    },
    resetPrefs() {
      tts.stop();
      prefs = { ...DEFAULT_A11Y_PREFS };
      setAccessibilityPrefs(prefs);
      apply();
      notify();
    },
    setLocale(loc) {
      setLocale(loc);
      notify();
    },
    destroy() {
      const body = document.body;
      A11Y_BODY_CLASSES.forEach((cls) => body?.classList.remove(cls));
      body?.classList.remove('a11y-scope');
      clearA11yVisualFilterEffects();
      clearA11yLiteracyEffects();
    },
  };
}

export function bootstrapAccessibilityScope() {
  initLocale();
  document.body.classList.add('incitta-site');
}
