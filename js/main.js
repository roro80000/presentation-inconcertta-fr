/**
 * Point d’entrée du site presentation.inconcertta.fr (statique, autonome).
 */

import { bootLuxuryStack } from './lux/boot-luxury.js';
import { initNavbarScroll, attachNavbarToLenis } from './hooks/navbar-scroll.js';
import { initMobileEnv } from './hooks/mobile-env.js';
import { initNavMobile } from './hooks/nav-mobile.js';
import { initAnchorSmoothScroll, scrollToHashIfPresent } from './hooks/anchor-smooth-scroll.js';
import { initFormInputs } from './hooks/form-inputs.js';
import { initLazyImages } from './hooks/lazy-images.js';
import { initHeroParallax } from './hooks/hero-parallax.js';
import { initRevealOnScroll } from './hooks/reveal-on-scroll.js';
import { initInconcerttaDemo } from './hooks/inconcertta-demo.js';
import { initGoatCounter } from './goatcounter.js';

initGoatCounter();
initNavbarScroll();
initMobileEnv();

async function boot() {
  await bootLuxuryStack();
  attachNavbarToLenis();
  initNavMobile();
  initAnchorSmoothScroll();
  scrollToHashIfPresent();
  initFormInputs();
  initLazyImages();
  initHeroParallax();
  initRevealOnScroll();
  initInconcerttaDemo();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => void boot());
} else {
  void boot();
}
