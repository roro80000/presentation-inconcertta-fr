/**
 * Point d’entrée accessibilité — site présentation InConcertta.
 */

import { ensureA11yContentWrapper } from './applyA11yEffects.js';
import { bootstrapAccessibilityScope, createAccessibilityStore } from './store.js';
import { mountA11yUI } from './ui.js';

/**
 * Initialise le volet accessibilité (bouton demi-cercle + panneau).
 * @returns {{ store: ReturnType<typeof createAccessibilityStore>, destroy: () => void }}
 */
export function initPresentationA11y() {
  bootstrapAccessibilityScope();
  ensureA11yContentWrapper();
  const store = createAccessibilityStore();
  const ui = mountA11yUI(store);
  store.apply();

  return {
    store,
    destroy() {
      ui.destroy();
      store.destroy();
      store.tts.destroy();
    },
  };
}
