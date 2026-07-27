/**
 * Distorsion légère au scroll rapide (approximation — pas de WebGL).
 */

export function initScrollDistortLux() {
  const els = document.querySelectorAll('.lux-distort');
  if (!els.length) return;

  let vy = 0;
  let lastY = window.scrollY;
  let lastT = performance.now();

  function tick() {
    const now = performance.now();
    const dt = Math.max(1, now - lastT);
    const y = window.__presentationLenis?.scroll ?? window.scrollY;
    const instant = ((y - lastY) / dt) * 16;
    vy = vy * 0.86 + instant * 0.14;
    lastY = y;
    lastT = now;

    vy *= 0.94;

    const skew = Math.max(-1.35, Math.min(1.35, vy * 0.018));
    const blur = Math.min(0.9, Math.abs(vy) * 0.0065);

    els.forEach((el) => {
      el.style.transform = Math.abs(skew) > 0.04 ? `skewY(${skew}deg)` : '';
      el.style.filter = blur > 0.12 ? `blur(${blur}px)` : '';
    });

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
