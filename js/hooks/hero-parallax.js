/**
 * Effet léger sur .page-hero .hero-content (si présent).
 */

export function initHeroParallax() {
  const pageHero = document.querySelector('.page-hero');
  const heroContent = document.querySelector('.page-hero .hero-content');

  if (!pageHero || !heroContent) return;

  let currentY = 0;
  let targetY = 0;
  const maxMovement = 60;

  function computeTargetY() {
    const rect = pageHero.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const visibleStart = Math.max(0, viewportHeight - rect.top);
    const progress = Math.min(
      1,
      Math.max(0, visibleStart / (viewportHeight + rect.height))
    );
    targetY = progress * maxMovement;
  }

  let ticking = false;
  function updateHero() {
    currentY += (targetY - currentY) * 0.15;
    heroContent.style.transform = `translateY(${currentY}px)`;
  }

  function onScroll() {
    computeTargetY();
    const rect = pageHero.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const progress = Math.min(
      1,
      Math.max(0, (viewportHeight - rect.top) / (viewportHeight + rect.height))
    );
    heroContent.style.opacity =
      progress > 0.7 ? Math.max(0, 1 - (progress - 0.7) / 0.3) : 1;
    if (!ticking) {
      requestAnimationFrame(() => {
        updateHero();
        ticking = false;
      });
      ticking = true;
    }
  }

  computeTargetY();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', computeTargetY);
}
