/**
 * Effets accessibilité « illettrisme / compréhension » : espacement des lignes.
 */

export const LINE_SPACING_LEVELS = ['normal', 'loose', 'extra'];

export const LINE_SPACING_CONFIG = {
  normal: { labelKey: 'display.lineSpacing.normal', lineHeight: 1.5, paragraphSpacing: '1em' },
  loose: { labelKey: 'display.lineSpacing.loose', lineHeight: 2.1, paragraphSpacing: '1.8em' },
  extra: { labelKey: 'display.lineSpacing.extra', lineHeight: 2.5, paragraphSpacing: '2.2em' },
};

const LINE_SPACING_STYLE_ID = 'inconcerta-line-spacing-styles';

function buildLineSpacingCSS(level) {
  if (level === 'normal') return '';

  const config = LINE_SPACING_CONFIG[level];
  if (!config) return '';

  return `
body.a11y-scope p,
body.a11y-scope li,
body.a11y-scope td,
body.a11y-scope th,
body.a11y-scope label,
body.a11y-scope span,
body.a11y-scope div,
body.a11y-scope a,
body.a11y-scope blockquote,
body.a11y-scope figcaption {
  line-height: ${config.lineHeight} !important;
}

body.a11y-scope h1,
body.a11y-scope h2,
body.a11y-scope h3,
body.a11y-scope h4,
body.a11y-scope h5,
body.a11y-scope h6 {
  line-height: ${Math.max(1.3, config.lineHeight - 0.4)} !important;
  margin-bottom: ${config.paragraphSpacing} !important;
}

body.a11y-scope p,
body.a11y-scope li {
  margin-bottom: ${config.paragraphSpacing} !important;
}
`;
}

function injectStyle(id, css) {
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('style');
    el.id = id;
    el.setAttribute('data-inconcerta-a11y', 'true');
    document.head.appendChild(el);
  }
  el.textContent = css;
}

function removeStyle(id) {
  document.getElementById(id)?.remove();
}

function applyLineSpacing(level) {
  if (level === 'normal') {
    removeStyle(LINE_SPACING_STYLE_ID);
    return;
  }

  if (!LINE_SPACING_CONFIG[level]) return;

  injectStyle(LINE_SPACING_STYLE_ID, buildLineSpacingCSS(level));
}

/**
 * @param {import('./accessibilityPrefs.js').DEFAULT_A11Y_PREFS} prefs
 */
export function applyA11yLiteracyEffects(prefs) {
  if (typeof document === 'undefined') return;

  const body = document.body;
  if (!body?.classList.contains('a11y-scope')) {
    clearA11yLiteracyEffects();
    return;
  }

  applyLineSpacing(prefs.lineSpacing);
}

export function clearA11yLiteracyEffects() {
  removeStyle(LINE_SPACING_STYLE_ID);
}
