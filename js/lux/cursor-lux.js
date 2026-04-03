/**
 * Curseur 8px, lag (lerp), inclusion (mix-blend) au survol liens / images.
 */

export function initLuxCursor() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const dot = document.createElement('div');
  dot.id = 'lux-cursor';
  dot.setAttribute('aria-hidden', 'true');
  document.body.appendChild(dot);

  document.documentElement.classList.add('lux-cursor-on');

  let tx = window.innerWidth / 2;
  let ty = window.innerHeight / 2;
  let cx = tx;
  let cy = ty;
  let raf = 0;

  const lerp = (a, b, t) => a + (b - a) * t;

  function loop() {
    cx = lerp(cx, tx, 0.14);
    cy = lerp(cy, ty, 0.14);
    dot.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
    raf = requestAnimationFrame(loop);
  }
  raf = requestAnimationFrame(loop);

  window.addEventListener(
    'pointermove',
    (e) => {
      tx = e.clientX;
      ty = e.clientY;
    },
    { passive: true }
  );

  const targets =
    'a, button, [role="button"], .nav-link, .btn-primary-ic, .btn-outline-ic, .feature-card, .demo-hit, img, .admin-screen-card';
  document.querySelectorAll(targets).forEach((el) => {
    el.addEventListener('pointerenter', () => dot.classList.add('is-hover'));
    el.addEventListener('pointerleave', () => dot.classList.remove('is-hover'));
  });
}
