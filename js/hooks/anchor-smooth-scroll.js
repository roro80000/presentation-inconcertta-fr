/**
 * Ancres internes # — offset navbar ; Lenis si actif (stack luxe).
 * `anchors: false` sur Lenis : pas de double prise en charge ; scrollTo explicite + offset.
 */

/** Défilement ancres : lent et aérien, aligné sur le ressenti Lenis */
function easeAerial(t) {
  return 1 - Math.pow(1 - t, 2.85);
}

function scrollToAnchor(target) {
  const nav = document.querySelector('.navbar');
  const pad = (nav?.offsetHeight ?? 96) + 16;
  const lenis = window.__presentationLenis;
  if (lenis && typeof lenis.scrollTo === 'function') {
    lenis.scrollTo(target, {
      offset: -pad,
      duration: 2.15,
      easing: easeAerial,
    });
    return;
  }
  const y =
    target.getBoundingClientRect().top +
    (window.__presentationLenis?.scroll ?? window.scrollY) -
    pad;
  window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
}

/** URL avec #section au chargement : un seul scroll (pas d’ancre native + Lenis). */
export function scrollToHashIfPresent() {
  const { hash } = window.location;
  if (!hash || hash === '#') return;
  let target;
  try {
    target = document.querySelector(hash);
  } catch {
    return;
  }
  if (!target) return;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => scrollToAnchor(target));
  });
}

export function initAnchorSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      scrollToAnchor(target);
    });
  });
}
