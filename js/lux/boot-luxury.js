/**
 * Stack « luxe » : Lenis + GSAP + ScrollTrigger + SplitType,
 * préchargeur, grain, parallaxe, curseur, distorsion scroll (approx. WebGL).
 */

import { ESM_LENIS, ESM_GSAP, ESM_SCROLL_TRIGGER, ESM_SPLIT_TYPE } from './constants.js';
import { injectGrain } from './grain.js';
import { runPreloader } from './preloader.js';
import { initLuxCursor } from './cursor-lux.js';
import { initParallaxLux } from './parallax-lux.js';
import { initScrollDistortLux } from './scroll-distort.js';

export function prefersReducedLuxMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Page contact : pas d’écran de chargement (accès direct au formulaire). */
function shouldSkipLuxPreloader() {
  return /contact\.html$/i.test(window.location.pathname);
}

/** Page gestion : uniquement le rideau (pas de barre / pourcentage). */
function shouldRunCurtainOnlyPreloader() {
  return /gestion\.html$/i.test(window.location.pathname);
}

function initHeroReveal(gsap, SplitType) {
  const h1 = document.querySelector('.lux-h1-animate');
  if (!h1) return;

  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  const lines = h1.querySelectorAll('.lux-line--mask');
  let first = true;

  lines.forEach((line) => {
    const brand = line.querySelector('.inconcertta-brand');
    const tail = line.querySelector('.lux-h1-tail');
    const sub = line.querySelector('.lux-h1-sub');
    const insert = first ? 0 : '>-0.34';
    first = false;

    if (brand) {
      const spans = brand.querySelectorAll(':scope > span');
      if (spans.length) {
        tl.from(
          spans,
          {
            y: 28,
            opacity: 0,
            filter: 'blur(10px)',
            stagger: 0.055,
            duration: 0.78,
          },
          insert
        );
      }
    } else if (tail && tail.textContent.trim()) {
      const st = new SplitType(tail, { types: 'chars', tagName: 'span' });
      tl.from(
        st.chars,
        {
          y: 20,
          opacity: 0,
          filter: 'blur(8px)',
          stagger: 0.016,
          duration: 0.72,
        },
        insert
      );
    } else if (sub && sub.textContent.trim()) {
      const st = new SplitType(sub, { types: 'chars', tagName: 'span' });
      tl.from(
        st.chars,
        {
          y: 20,
          opacity: 0,
          filter: 'blur(8px)',
          stagger: 0.014,
          duration: 0.68,
        },
        insert
      );
    }
  });
}

function initSplitHeadings(gsap, ScrollTrigger, SplitType) {
  document.querySelectorAll('h2.lux-split-chars').forEach((h2) => {
    const split = new SplitType(h2, { types: 'chars', tagName: 'span' });
    gsap.from(split.chars, {
      y: 20,
      opacity: 0,
      filter: 'blur(6px)',
      stagger: 0.034,
      duration: 1.22,
      ease: 'expo.out',
      scrollTrigger: {
        trigger: h2,
        start: 'top 88%',
        toggleActions: 'play none none none',
      },
    });
  });

  /* Titres riches (marques imbriquées) : révélation bloc, pas SplitType */
  document.querySelectorAll('h2.lux-block-reveal').forEach((h2) => {
    gsap.from(h2, {
      y: 26,
      opacity: 0,
      filter: 'blur(6px)',
      duration: 1.35,
      ease: 'expo.out',
      scrollTrigger: {
        trigger: h2,
        start: 'top 86%',
        toggleActions: 'play none none none',
      },
    });
  });
}

export async function bootLuxuryStack() {
  document.documentElement.classList.add('lux-stack');

  if (prefersReducedLuxMotion()) {
    window.__presentationLenis = null;
    return;
  }

  injectGrain();

  const skipPreloader = shouldSkipLuxPreloader();
  if (!skipPreloader) {
    document.body.classList.add('lux-preloader-lock');
  }

  let Lenis;
  let gsap;
  let ScrollTrigger;
  let SplitType;

  try {
    const [lenisMod, gsapMod, stMod, splitMod] = await Promise.all([
      import(ESM_LENIS),
      import(ESM_GSAP),
      import(ESM_SCROLL_TRIGGER),
      import(ESM_SPLIT_TYPE),
    ]);
    Lenis = lenisMod.default;
    gsap = gsapMod.default;
    ScrollTrigger = stMod.default;
    SplitType = splitMod.default;
  } catch (e) {
    console.warn('[lux] Chargement des modules impossible', e);
    document.body.classList.remove('lux-preloader-lock');
    document.getElementById('lux-preloader')?.remove();
    window.__presentationLenis = null;
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  if (!gsap || !ScrollTrigger || !Lenis || !SplitType) {
    console.warn('[lux] Module manquant (gsap / ScrollTrigger / Lenis / SplitType).');
    document.body.classList.remove('lux-preloader-lock');
    document.getElementById('lux-preloader')?.remove();
    window.__presentationLenis = null;
    return;
  }

  if (!skipPreloader) {
    if (shouldRunCurtainOnlyPreloader()) {
      await runPreloader({ curtainOnly: true, curtainHoldMs: 100 });
    } else {
      await runPreloader({ minMs: document.querySelector('.lux-h1-animate') ? 720 : 420 });
    }
  }

  const lenis = new Lenis({
    smoothWheel: true,
    wheelMultiplier: 0.88,
    touchMultiplier: 1.75,
    syncTouch: true,
  });
  window.__presentationLenis = lenis;

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  initHeroReveal(gsap, SplitType);
  initSplitHeadings(gsap, ScrollTrigger, SplitType);
  initParallaxLux(gsap);
  initLuxCursor();
  initScrollDistortLux();

  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  requestAnimationFrame(() => ScrollTrigger.refresh());
}
