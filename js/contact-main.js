/**
 * Page contact — accessibilité + bannière cookies (pas de Lux / i18n site).
 */

import { initPresentationA11y } from './accessibility/init-a11y.js';
import { initCookieBanner } from './cookie-banner.js';

function startContactPage() {
  initCookieBanner();
  initPresentationA11y();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startContactPage);
} else {
  startContactPage();
}
