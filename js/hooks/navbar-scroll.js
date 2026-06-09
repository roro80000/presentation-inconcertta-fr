/**
 * Classe .scrolled sur la navbar au défilement.
 * Avec Lenis, on lit lenis.scroll (scroll animé) ; sinon window.scrollY.
 */

import { throttle } from '../utils/perf.js';

function scrollThreshold() {
  return window.matchMedia('(max-width: 600px)').matches ? 8 : 100;
}

function applyNavbarScrolledState() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  const y = window.__presentationLenis?.scroll ?? window.scrollY;
  if (y > scrollThreshold()) navbar.classList.add('scrolled');
  else navbar.classList.remove('scrolled');
}

const handleNavbarScroll = throttle(applyNavbarScrolledState, 80);

export function initNavbarScroll() {
  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
}

/** À appeler après `bootLuxuryStack()` pour suivre le scroll lissé frame à frame. */
export function attachNavbarToLenis() {
  window.__presentationLenis?.on('scroll', handleNavbarScroll);
}
