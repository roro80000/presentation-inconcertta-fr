/**
 * Préchargeur : logo + barre + pourcentage, puis disparition en rideau vertical
 * (deux volets qui s’écartent) après 100 %.
 * Mode `curtainOnly` : voile plein écran puis même ouverture (pas de % ni barre).
 */

const VEIL_MARKUP = `
  <div class="lux-preloader__veil" aria-hidden="true">
    <span class="lux-preloader__panel lux-preloader__panel--left"></span>
    <span class="lux-preloader__panel lux-preloader__panel--right"></span>
  </div>`;

/**
 * @param {{ curtainOnly?: boolean }} opts
 */
export function createPreloaderMarkup(opts = {}) {
  if (document.getElementById('lux-preloader')) return document.getElementById('lux-preloader');

  const el = document.createElement('div');
  el.id = 'lux-preloader';
  el.setAttribute('aria-busy', 'true');
  if (opts.curtainOnly) {
    el.classList.add('lux-preloader--curtain-only');
    el.innerHTML = VEIL_MARKUP;
  } else {
    el.innerHTML = `${VEIL_MARKUP}
    <div class="lux-preloader__inner">
      <img class="lux-preloader__logo" src="/assets/images/logos/Logo InConcertta.png" alt="InConcertta" width="840" height="360" decoding="async">
      <div class="lux-preloader__track" aria-hidden="true">
        <div class="lux-preloader__bar"></div>
      </div>
      <p class="lux-preloader__pct"><span class="lux-preloader__value">0</span><span class="lux-preloader__unit">%</span></p>
    </div>
  `;
  }
  document.body.prepend(el);
  return el;
}

function playCurtainOut(root) {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      root.setAttribute('aria-busy', 'false');
      root.classList.add('lux-preloader--curtain');
      let finished = false;
      let panelEnds = 0;
      const done = () => {
        if (finished) return;
        finished = true;
        root.removeEventListener('transitionend', onTransitionEnd);
        document.body.classList.remove('lux-preloader-lock');
        root.remove();
        resolve();
      };
      const onTransitionEnd = (e) => {
        if (e.propertyName !== 'transform') return;
        const t = e.target;
        if (!(t instanceof Element) || !t.classList.contains('lux-preloader__panel')) return;
        panelEnds += 1;
        if (panelEnds >= 2) done();
      };
      root.addEventListener('transitionend', onTransitionEnd);
      setTimeout(done, 1400);
    });
  });
}

/**
 * @param {{ minMs?: number, curtainOnly?: boolean, curtainHoldMs?: number }} opts
 * @returns {Promise<void>}
 */
export function runPreloader(opts = {}) {
  const { minMs = 700, curtainOnly = false, curtainHoldMs = 100 } = opts;
  const root = createPreloaderMarkup({ curtainOnly });

  if (curtainOnly) {
    return Promise.all([
      document.fonts?.ready ?? Promise.resolve(),
      new Promise((r) => setTimeout(r, curtainHoldMs)),
    ]).then(() => playCurtainOut(root));
  }

  const bar = root.querySelector('.lux-preloader__bar');
  const valueEl = root.querySelector('.lux-preloader__value');
  const start = performance.now();
  let shown = 0;

  function setPct(p) {
    shown = Math.min(100, p);
    if (bar) bar.style.transform = `scaleX(${shown / 100})`;
    if (valueEl) valueEl.textContent = String(Math.round(shown));
  }

  const raf = () => {
    const elapsed = performance.now() - start;
    const fake = Math.min(90, (elapsed / minMs) * 90);
    setPct(Math.max(shown, fake));
    if (shown < 90) requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);

  return Promise.all([
    document.fonts?.ready ?? Promise.resolve(),
    new Promise((r) => setTimeout(r, minMs)),
  ]).then(() => {
    setPct(100);
    return playCurtainOut(root);
  });
}
