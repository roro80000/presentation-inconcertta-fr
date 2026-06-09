/**
 * Préférences d'affichage sur-mesure (player) — persistance localStorage.
 * @see docs/AUDIT_ACCESSIBILITE_PLAYER.md §6
 */

export const FONT_SCALE_NORMAL = 1;
export const FONT_SCALE_LARGE = 1.25;
export const FONT_SCALE_XLARGE = 1.5;

export const LINE_SPACING_NORMAL = 'normal';
export const LINE_SPACING_LOOSE = 'loose';
export const LINE_SPACING_EXTRA = 'extra';

export const DEFAULT_A11Y_PREFS = {
  fontScale: FONT_SCALE_NORMAL,
  smartInvert: false,
  highContrast: false,
  linkHighlight: false,
  largeCursor: false,
  dyslexia: false,
  colorBlindness: 'off',
  reduceMotion: false,
  motorAssist: false,
  focusMode: false,
  lineSpacing: LINE_SPACING_NORMAL,
  ttsTopbar: false,
};

const LINE_SPACING_VALUES = [
  LINE_SPACING_NORMAL,
  LINE_SPACING_LOOSE,
  LINE_SPACING_EXTRA,
];

const LINE_SPACING_LEGACY_MAP = {
  relaxed: LINE_SPACING_LOOSE,
};

const LEGACY_LINE_SPACING_KEY = 'inconcerta_line_spacing';

const STORAGE_KEY = 'inconcertta:a11y-prefs';

const COLOR_BLINDNESS_VALUES = [
  'off',
  'protanopia',
  'deuteranopia',
  'tritanopia',
  'achromatopsia',
];

const BOOL_KEYS = [
  'smartInvert',
  'highContrast',
  'linkHighlight',
  'largeCursor',
  'dyslexia',
  'reduceMotion',
  'motorAssist',
  'focusMode',
  'ttsTopbar',
];

/**
 * @param {unknown} raw
 * @returns {1|1.25|1.5}
 */
export function normalizeFontScale(raw) {
  const n = Number(raw);
  if (n === FONT_SCALE_XLARGE || n >= FONT_SCALE_XLARGE) return FONT_SCALE_XLARGE;
  if (n === FONT_SCALE_LARGE) return FONT_SCALE_LARGE;
  if (n === FONT_SCALE_NORMAL) return FONT_SCALE_NORMAL;
  // Migration des anciennes valeurs intermédiaires
  if (n > FONT_SCALE_LARGE && n < FONT_SCALE_XLARGE) return FONT_SCALE_LARGE;
  if (n > FONT_SCALE_NORMAL && n < FONT_SCALE_LARGE) return FONT_SCALE_LARGE;
  return FONT_SCALE_NORMAL;
}

/**
 * @param {unknown} partial
 * @returns {typeof DEFAULT_A11Y_PREFS}
 */
export function sanitizePrefs(partial) {
  const out = { ...DEFAULT_A11Y_PREFS };
  if (!partial || typeof partial !== 'object') return out;

  const src = /** @type {Record<string, unknown>} */ (partial);

  out.fontScale = normalizeFontScale(src.fontScale);

  if (COLOR_BLINDNESS_VALUES.includes(src.colorBlindness)) {
    out.colorBlindness = src.colorBlindness;
  }

  for (const key of BOOL_KEYS) {
    if (typeof src[key] === 'boolean') {
      out[key] = src[key];
    }
  }

  if (LINE_SPACING_VALUES.includes(src.lineSpacing)) {
    out.lineSpacing = src.lineSpacing;
  } else if (LINE_SPACING_LEGACY_MAP[src.lineSpacing]) {
    out.lineSpacing = LINE_SPACING_LEGACY_MAP[src.lineSpacing];
  }

  if (typeof src.ttsTopbar === 'boolean') {
    out.ttsTopbar = src.ttsTopbar;
  } else if (typeof src.ttsMobileTopbar === 'boolean') {
    out.ttsTopbar = src.ttsMobileTopbar;
  }

  return out;
}

function readLegacyLiteracyPrefs() {
  const legacy = {};
  try {
    if (typeof window === 'undefined' || !window.localStorage) return legacy;
    const line = window.localStorage.getItem(LEGACY_LINE_SPACING_KEY);
    if (LINE_SPACING_VALUES.includes(line)) {
      legacy.lineSpacing = line;
    } else if (LINE_SPACING_LEGACY_MAP[line]) {
      legacy.lineSpacing = LINE_SPACING_LEGACY_MAP[line];
    }
  } catch { /* ignore */ }
  return legacy;
}

/**
 * @returns {typeof DEFAULT_A11Y_PREFS}
 */
export function getAccessibilityPrefs() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return { ...DEFAULT_A11Y_PREFS };
    }
    const legacy = readLegacyLiteracyPrefs();
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return sanitizePrefs(legacy);
    const parsed = JSON.parse(raw);
    return sanitizePrefs({ ...legacy, ...parsed });
  } catch {
    return { ...DEFAULT_A11Y_PREFS };
  }
}

/**
 * @param {typeof DEFAULT_A11Y_PREFS} prefs
 */
export function setAccessibilityPrefs(prefs) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const safe = sanitizePrefs(prefs);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
  } catch {
    // ignore storage errors
  }
}

/**
 * @param {typeof DEFAULT_A11Y_PREFS} prefs
 * @returns {boolean}
 */
export function isAnyA11yPrefEnabled(prefs) {
  const p = sanitizePrefs(prefs);
  return JSON.stringify(p) !== JSON.stringify(DEFAULT_A11Y_PREFS);
}
