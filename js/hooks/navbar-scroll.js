/**
 * Classe .scrolled sur la navbar au défilement.
 */

import { throttle } from '../utils/perf.js';

const handleNavbarScroll = throttle(() => {
  const navbar = document.querySelector('.navbar');
  if (navbar && window.scrollY > 100) {
    navbar.classList.add('scrolled');
  } else if (navbar) {
    navbar.classList.remove('scrolled');
  }
}, 100);

export function initNavbarScroll() {
  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
}
