/**
 * Animation d’entrée .fade-in-up au scroll (IntersectionObserver).
 */

export function initRevealOnScroll() {
  if (!('IntersectionObserver' in window)) return;

  const revealObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in-up');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
  );

  const targets = document.querySelectorAll(
    '.section-header, .service-block, .faq-item, .value-item, .contact-block, .legal-content, .main-read'
  );
  targets.forEach((el) => revealObserver.observe(el));
}
