/**
 * Hero au scroll : léger translateY + fondu (lerp), calé sur la position réelle de scroll.
 * Avec Lenis, on écoute `lenis.on('scroll')` pour suivre le défilement lissé frame à frame ;
 * sinon repli sur l’événement `scroll` natif.
 *
 * Cible : `.page-hero .hero-content` si présent, sinon `.page-hero .page-hero-text` (markup InConcertta).
 */

export function initHeroParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const pageHero = document.querySelector('.page-hero');
  const heroContent =
    document.querySelector('.page-hero .hero-content') ?? document.querySelector('.page-hero .page-hero-text');

  if (!pageHero || !heroContent) return;

  let currentY = 0;
  let targetY = 0;
  const maxMovement = 68;

  function computeTargetY() {
    const rect = pageHero.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const visibleStart = Math.max(0, viewportHeight - rect.top);
    const progress = Math.min(1, Math.max(0, visibleStart / (viewportHeight + rect.height)));
    targetY = progress * maxMovement;
  }

  let ticking = false;
  function updateHero() {
    currentY += (targetY - currentY) * 0.14;
    heroContent.style.transform = `translate3d(0, ${currentY}px, 0)`;
  }

  function onScroll() {
    computeTargetY();
    const rect = pageHero.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const progress = Math.min(1, Math.max(0, (viewportHeight - rect.top) / (viewportHeight + rect.height)));
    heroContent.style.opacity = progress > 0.68 ? Math.max(0, 1 - (progress - 0.68) / 0.32) : 1;
    if (!ticking) {
      requestAnimationFrame(() => {
        updateHero();
        ticking = false;
      });
      ticking = true;
    }
  }

  function onResize() {
    computeTargetY();
    onScroll();
  }

  computeTargetY();
  onScroll();

  const lenis = window.__presentationLenis;
  if (lenis && typeof lenis.on === 'function') {
    lenis.on('scroll', onScroll);
  } else {
    window.addEventListener('scroll', onScroll, { passive: true });
  }
  window.addEventListener('resize', onResize, { passive: true });
}
