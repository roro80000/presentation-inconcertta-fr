/**
 * Ancres internes # — offset navbar ; Lenis si actif (stack luxe).
 */

function scrollToAnchor(target) {
  const nav = document.querySelector('.navbar');
  const pad = (nav?.offsetHeight ?? 96) + 16;
  const y = target.getBoundingClientRect().top + window.scrollY - pad;
  const lenis = window.__presentationLenis;
  if (lenis && typeof lenis.scrollTo === 'function') {
    lenis.scrollTo(y, { duration: 1.05 });
  } else {
    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
  }
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
