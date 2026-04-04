/**
 * Stack « luxe » : Lenis + GSAP + ScrollTrigger + SplitType,
 * préchargeur, grain, parallaxe, curseur, distorsion scroll (approx. WebGL).
 *
 * Lenis + ScrollTrigger (recommandé darkroom / GSAP) :
 * - `scrollerProxy(document.documentElement)` : ScrollTrigger lit la position lissée via Lenis.
 * - `lenis.on('scroll', ScrollTrigger.update)` : recalcul des triggers à chaque tick Lenis.
 * - `gsap.ticker` + `lenis.raf(time * 1000)` + `lagSmoothing(0)` : même horloge que GSAP, pas de décalage.
 * - Ancres : `anchors: false` sur Lenis pour éviter le double traitement ; défilement via
 *   `anchor-smooth-scroll.js` → `lenis.scrollTo(...)` avec offset navbar.
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

/** Révélation titre : SplitType + blur → net, montée 10px, rythme très lent */
const HERO_CHAR_FROM = {
  y: 10,
  opacity: 0,
  filter: 'blur(14px)',
  stagger: 0.088,
  duration: 1.62,
  ease: 'power2.out',
};

function initHeroReveal(gsap, SplitType) {
  const h1 = document.querySelector('.lux-h1-animate');
  if (!h1) return;

  const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
  const lines = h1.querySelectorAll('.lux-line--mask');
  let first = true;

  lines.forEach((line) => {
    const brand = line.querySelector('.inconcertta-brand');
    const tail = line.querySelector('.lux-h1-tail');
    const sub = line.querySelector('.lux-h1-sub');
    const insert = first ? 0 : '>-0.28';
    first = false;

    if (brand) {
      const spans = [...brand.querySelectorAll(':scope > span')].filter((s) => s.textContent.trim());
      let brandPos = insert;
      spans.forEach((span) => {
        const st = new SplitType(span, { types: 'chars', tagName: 'span' });
        tl.from(st.chars, { ...HERO_CHAR_FROM }, brandPos);
        brandPos = '>';
      });
    } else if (tail && tail.textContent.trim()) {
      const st = new SplitType(tail, { types: 'chars', tagName: 'span' });
      tl.from(st.chars, { ...HERO_CHAR_FROM }, insert);
    } else if (sub && sub.textContent.trim()) {
      const st = new SplitType(sub, { types: 'chars', tagName: 'span' });
      tl.from(st.chars, { ...HERO_CHAR_FROM }, insert);
    }
  });
}

/**
 * Parallaxe inverse sur le h1 : souris vers le haut → le bloc titre descend légèrement (profondeur).
 */
function initHeroH1MouseParallax(gsap, h1) {
  if (!h1 || window.matchMedia('(pointer: coarse)').matches) return;
  const hero = h1.closest('.page-hero');
  if (!hero) return;

  const maxX = 7;
  const maxY = 6;
  gsap.set(h1, { x: 0, y: 0 });

  const quickX = gsap.quickTo(h1, 'x', { duration: 0.65, ease: 'power3.out' });
  const quickY = gsap.quickTo(h1, 'y', { duration: 0.65, ease: 'power3.out' });

  hero.addEventListener('pointermove', (e) => {
    const rect = hero.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    quickX(-px * 2 * maxX);
    quickY(-py * 2 * maxY);
  });
  hero.addEventListener('pointerleave', () => {
    quickX(0);
    quickY(0);
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

  /* Très fluide, presque aérien : lerp bas + moindre amplitude molette / touch */
  const lenis = new Lenis({
    smoothWheel: true,
    syncTouch: true,
    syncTouchLerp: 0.034,
    touchInertiaExponent: 1.38,
    lerp: 0.034,
    /* Un peu plus lisible sur trackpad / molette tout en restant « lourd » */
    wheelMultiplier: 0.56,
    touchMultiplier: 0.82,
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    autoRaf: false,
    anchors: false,
    stopInertiaOnNavigate: true,
    overscroll: true,
  });
  window.__presentationLenis = lenis;

  ScrollTrigger.scrollerProxy(document.documentElement, {
    scrollTop(value) {
      if (arguments.length && lenis) {
        lenis.scrollTo(value, { immediate: true });
      }
      return lenis ? lenis.scroll : window.scrollY || document.documentElement.scrollTop;
    },
    getBoundingClientRect() {
      return {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      };
    },
    pinType: 'transform',
  });

  ScrollTrigger.defaults({ scroller: document.documentElement });
  ScrollTrigger.refresh();

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  const refreshLenisAndST = () => {
    lenis.resize();
    ScrollTrigger.refresh();
  };
  window.addEventListener('resize', refreshLenisAndST);

  initHeroReveal(gsap, SplitType);
  const heroH1 = document.querySelector('.lux-h1-animate');
  if (heroH1?.closest('.page-hero')) {
    initHeroH1MouseParallax(gsap, heroH1);
  }
  initSplitHeadings(gsap, ScrollTrigger, SplitType);
  initParallaxLux(gsap);
  initLuxCursor();
  initScrollDistortLux();

  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  requestAnimationFrame(() => ScrollTrigger.refresh());
}
