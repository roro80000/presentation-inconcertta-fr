/**
 * Point d’entrée du site presentation.inconcertta.fr (statique, autonome).
 */

import './seo/init-seo.js';
import { bootLuxuryStack } from './lux/boot-luxury.js';
import { initNavbarScroll, attachNavbarToLenis } from './hooks/navbar-scroll.js';
import { initMobileEnv } from './hooks/mobile-env.js';
import { initNavMobile } from './hooks/nav-mobile.js';
import { initAnchorSmoothScroll, scrollToHashIfPresent } from './hooks/anchor-smooth-scroll.js';
import { initFormInputs } from './hooks/form-inputs.js';
import { initContactForm } from './hooks/contact-form.js';
import { initLazyImages } from './hooks/lazy-images.js';
import { initHeroParallax } from './hooks/hero-parallax.js';
import { initRevealOnScroll } from './hooks/reveal-on-scroll.js';
import { initInconcerttaDemo } from './hooks/inconcertta-demo.js';
import { initGoatCounter } from './goatcounter.js';
import { initPresentationA11y } from './accessibility/init-a11y.js';
import { initSiteI18n } from './i18n/site-i18n.js';

initGoatCounter();
initNavbarScroll();
initMobileEnv();

async function boot() {
  try {
    await bootLuxuryStack();
  } catch (err) {
    console.warn('[boot] lux stack indisponible', err);
  }

  attachNavbarToLenis();
  initNavMobile();
  initAnchorSmoothScroll();
  scrollToHashIfPresent();
  initFormInputs();
  initLazyImages();
  initHeroParallax();
  initRevealOnScroll();
  initInconcerttaDemo();

  try {
    const a11y = initPresentationA11y();
    initSiteI18n(a11y.store);
  } catch (err) {
    console.warn('[boot] i18n / a11y indisponible', err);
  }

  initContactForm();
}

function startApp() {
  initContactForm();
  void boot();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
