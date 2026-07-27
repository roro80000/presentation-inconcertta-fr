/**
 * Parallaxe : images / blocs lents vs micro-textes plus « nerveux ».
 */

export function initParallaxLux(gsap) {
  document.querySelectorAll('.lux-parallax-slow').forEach((el) => {
    const trig = el.closest('section, .page-hero, .inconcertta-demo-section, header') || el;
    gsap.to(el, {
      y: -34,
      ease: 'none',
      scrollTrigger: {
        trigger: trig,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.15,
      },
    });
  });

  document.querySelectorAll('.lux-parallax-fast').forEach((el) => {
    const trig = el.closest('section, .page-hero, .inconcertta-demo-section') || el;
    gsap.to(el, {
      y: 24,
      ease: 'none',
      scrollTrigger: {
        trigger: trig,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.62,
      },
    });
  });
}
