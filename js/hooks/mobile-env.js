/**
 * Réglages globaux selon l’appareil (mobile).
 */

import { isMobile } from '../utils/device.js';

export function initMobileEnv() {
  if (isMobile) {
    document.documentElement.style.setProperty('--animation-duration', '0.2s');
    document.addEventListener(
      'touchstart',
      function () {},
      true
    );
  }
}
