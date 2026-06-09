/**
 * Drapeaux SVG compacts pour le sélecteur de langue.
 */

const SVG_ATTRS =
  'xmlns="http://www.w3.org/2000/svg" class="incitta-a11y-locale__flag" viewBox="0 0 24 16" width="24" height="16" aria-hidden="true" focusable="false"';

/** @type {Record<string, string>} */
export const LOCALE_FLAG_SVG = {
  fr: `<svg ${SVG_ATTRS}><rect width="8" height="16" fill="#002395"/><rect x="8" width="8" height="16" fill="#FFFFFF"/><rect x="16" width="8" height="16" fill="#ED2939"/></svg>`,
  en: `<svg ${SVG_ATTRS}><rect fill="#012169" width="24" height="16"/><path fill="#FFFFFF" d="M0 0l24 16M24 0L0 16" stroke="#FFFFFF" stroke-width="2.5"/><path fill="none" stroke="#C8102E" stroke-width="1.2" d="M0 0l24 16M24 0L0 16"/><rect x="10" width="4" height="16" fill="#FFFFFF"/><rect y="6" width="24" height="4" fill="#FFFFFF"/><rect x="11" width="2" height="16" fill="#C8102E"/><rect y="7" width="24" height="2" fill="#C8102E"/></svg>`,
  es: `<svg ${SVG_ATTRS}><rect fill="#AA151B" width="24" height="4"/><rect y="4" fill="#F1BF00" width="24" height="8"/><rect y="12" fill="#AA151B" width="24" height="4"/></svg>`,
  it: `<svg ${SVG_ATTRS}><rect width="8" height="16" fill="#009246"/><rect x="8" width="8" height="16" fill="#FFFFFF"/><rect x="16" width="8" height="16" fill="#CE2B37"/></svg>`,
};

/**
 * @param {string} locale
 * @returns {string}
 */
export function getLocaleFlagSvg(locale) {
  return LOCALE_FLAG_SVG[locale] ?? '';
}
