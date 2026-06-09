/**
 * Page contact — accessibilité uniquement (pas de Lux, i18n site, ni logique formulaire).
 */

import { initPresentationA11y } from './accessibility/init-a11y.js';

function startContactA11y() {
  initPresentationA11y();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startContactA11y);
} else {
  startContactA11y();
}
