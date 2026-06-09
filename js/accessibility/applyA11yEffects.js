/**
 * Effets visuels accessibilité (contraste, filtres, taille, curseur…).
 */

const FILTER_STYLE_ID = 'inconcerta-a11y-color-filter';
const FILTER_DEFS_ID = 'inconcerta-a11y-svg-filters';
export const CONTENT_WRAP_ID = 'incitta-a11y-content-wrap';
const A11Y_ROOT_ID = 'incitta-a11y-root';

export const A11Y_BODY_CLASSES = [
  'a11y-high-contrast',
  'a11y-link-highlight',
  'a11y-large-cursor',
  'a11y-dyslexia',
  'a11y-reduce-motion',
  'a11y-motor-assist',
  'a11y-focus-mode',
  'a11y-font-large',
  'a11y-font-xlarge',
  'a11y-protanopia',
  'a11y-deuteranopia',
  'a11y-tritanopia',
  'a11y-achromatopsia',
];

const CONTENT_FILTER_CLASSES = ['a11y-smart-invert'];

const COLOR_BLINDNESS_CLASS = {
  protanopia: 'a11y-protanopia',
  deuteranopia: 'a11y-deuteranopia',
  tritanopia: 'a11y-tritanopia',
  achromatopsia: 'a11y-achromatopsia',
};

function ensureSvgFilters() {
  if (document.getElementById(FILTER_DEFS_ID)) return;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.style.position = 'absolute';
  svg.style.width = '0';
  svg.style.height = '0';
  svg.style.overflow = 'hidden';
  svg.id = FILTER_DEFS_ID;

  svg.innerHTML = `
<defs>
  <filter id="a11y-filter-protanopia"><feColorMatrix type="matrix" values="0.567 0.433 0 0 0  0.558 0.442 0 0 0  0 0.242 0.758 0 0  0 0 0 1 0"/></filter>
  <filter id="a11y-filter-deuteranopia"><feColorMatrix type="matrix" values="0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0"/></filter>
  <filter id="a11y-filter-tritanopia"><feColorMatrix type="matrix" values="0.95 0.05 0 0 0  0 0.433 0.567 0 0  0 0.475 0.525 0 0  0 0 0 1 0"/></filter>
  <filter id="a11y-filter-achromatopsia"><feColorMatrix type="matrix" values="0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0"/></filter>
</defs>`;

  document.body.appendChild(svg);
}

function applyColorBlindnessFilter(mode) {
  let el = document.getElementById(FILTER_STYLE_ID);
  if (mode === 'off') {
    el?.remove();
    return;
  }

  ensureSvgFilters();

  const filterId = {
    protanopia: 'a11y-filter-protanopia',
    deuteranopia: 'a11y-filter-deuteranopia',
    tritanopia: 'a11y-filter-tritanopia',
    achromatopsia: 'a11y-filter-achromatopsia',
  }[mode];

  if (!filterId) return;

  if (!el) {
    el = document.createElement('style');
    el.id = FILTER_STYLE_ID;
    el.setAttribute('data-inconcerta-a11y', 'true');
    document.head.appendChild(el);
  }

  el.textContent = `
#${CONTENT_WRAP_ID} {
  filter: url(#${filterId});
}
#${CONTENT_WRAP_ID} img,
#${CONTENT_WRAP_ID} video,
#${CONTENT_WRAP_ID} picture,
#${CONTENT_WRAP_ID} svg:not(#${FILTER_DEFS_ID}) {
  filter: none;
}`;
}

function getContentWrap() {
  return document.getElementById(CONTENT_WRAP_ID);
}

/**
 * Isole le contenu page des filtres visuels pour garder le bouton/volet a11y intact.
 */
export function ensureA11yContentWrapper() {
  if (typeof document === 'undefined') return null;

  const body = document.body;
  if (!body || document.getElementById(CONTENT_WRAP_ID)) {
    return getContentWrap();
  }

  const wrap = document.createElement('div');
  wrap.id = CONTENT_WRAP_ID;
  wrap.className = 'incitta-a11y-content-wrap';

  [...body.childNodes].forEach((node) => {
    if (node.nodeType !== 1) {
      wrap.appendChild(node);
      return;
    }
    const el = /** @type {HTMLElement} */ (node);
    if (el.id === A11Y_ROOT_ID) return;
    wrap.appendChild(node);
  });

  body.insertBefore(wrap, body.firstChild);
  return wrap;
}

/**
 * @param {import('./accessibilityPrefs.js').DEFAULT_A11Y_PREFS} prefs
 */
export function applyA11yEffects(prefs) {
  if (typeof document === 'undefined') return;

  const body = document.body;
  if (!body) return;

  const contentWrap = ensureA11yContentWrapper();

  body.classList.add('a11y-scope');
  A11Y_BODY_CLASSES.forEach((cls) => body.classList.remove(cls));
  CONTENT_FILTER_CLASSES.forEach((cls) => contentWrap?.classList.remove(cls));

  if (prefs.fontScale >= 1.5) body.classList.add('a11y-font-xlarge');
  else if (prefs.fontScale >= 1.25) body.classList.add('a11y-font-large');

  if (prefs.smartInvert) contentWrap?.classList.add('a11y-smart-invert');
  if (prefs.highContrast) body.classList.add('a11y-high-contrast');
  if (prefs.linkHighlight) body.classList.add('a11y-link-highlight');
  if (prefs.largeCursor) body.classList.add('a11y-large-cursor');
  if (prefs.dyslexia) body.classList.add('a11y-dyslexia');
  if (prefs.reduceMotion) body.classList.add('a11y-reduce-motion');
  if (prefs.motorAssist) body.classList.add('a11y-motor-assist');
  if (prefs.focusMode) body.classList.add('a11y-focus-mode');

  const cbClass = COLOR_BLINDNESS_CLASS[prefs.colorBlindness];
  if (cbClass) body.classList.add(cbClass);

  applyColorBlindnessFilter(prefs.colorBlindness);
  document.documentElement.style.setProperty('--a11y-font-scale', String(prefs.fontScale));

  const disableLuxCursor = prefs.largeCursor || prefs.highContrast || prefs.reduceMotion;
  document.documentElement.classList.toggle('a11y-disable-lux-cursor', disableLuxCursor);
}

export function clearA11yVisualFilterEffects() {
  document.getElementById(FILTER_STYLE_ID)?.remove();
  document.getElementById(FILTER_DEFS_ID)?.remove();
  document.documentElement.style.removeProperty('--a11y-font-scale');
  document.documentElement.classList.remove('a11y-disable-lux-cursor');
}
