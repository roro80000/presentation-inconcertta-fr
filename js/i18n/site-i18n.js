/**
 * Moteur i18n du site — FR = HTML source, EN/ES/IT via bundles.
 */

import { TRANSLATIONS } from './locales/index.js';
import { getLocale } from '../accessibility/strings.js';
import { injectFooterMaillage } from '../seo/footer-maillage.js';

const LOCALE_EVENT = 'inconcertta:localechange';

let activeLocale = 'fr';
let defaultTitle = '';
let defaultDescription = '';

export function getPageId() {
  const raw = (window.location.pathname || '/').toLowerCase().replace(/\/$/, '') || '/';
  if (raw === '/' || raw.endsWith('/index.html')) return 'index';
  if (raw.endsWith('contact.html') || raw.endsWith('/contact')) return 'contact';
  if (raw.endsWith('gestion.html') || raw.endsWith('/gestion')) return 'gestion';
  if (raw.endsWith('mentions-legales.html') || raw.endsWith('/mentions-legales')) return 'mentions';
  if (raw.endsWith('merci.html') || raw.endsWith('/merci')) return 'merci';
  return 'index';
}

export function siteT(key, locale = activeLocale) {
  if (locale === 'fr') return null;
  const dict = TRANSLATIONS[locale] || TRANSLATIONS.en;
  return dict?.[key] ?? TRANSLATIONS.en?.[key] ?? key;
}

function parseAttrSpec(spec) {
  if (!spec) return null;
  const trimmed = spec.trim();
  if (trimmed.startsWith('{')) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return null;
    }
  }
  const colon = trimmed.indexOf(':');
  if (colon > 0) {
    return { [trimmed.slice(0, colon).trim()]: trimmed.slice(colon + 1).trim() };
  }
  return null;
}

function resolveAttrValue(key, locale) {
  if (locale === 'fr') return null;
  return siteT(key, locale);
}

function applyAttrElement(el, locale) {
  const specRaw = el.dataset.i18nDefaultAttr || el.getAttribute('data-i18n-attr');
  const spec = parseAttrSpec(specRaw);
  if (!spec) return;

  if (locale === 'fr') {
    const saved = el.dataset.i18nAttrSnapshot;
    if (saved) {
      try {
        const snap = JSON.parse(saved);
        Object.entries(snap).forEach(([attr, val]) => {
          if (val == null || val === '') el.removeAttribute(attr);
          else el.setAttribute(attr, val);
        });
      } catch { /* ignore */ }
    }
    return;
  }

  if (!el.dataset.i18nAttrSnapshot) {
    const snap = {};
    Object.keys(spec).forEach((attr) => {
      snap[attr] = el.getAttribute(attr) ?? '';
    });
    el.dataset.i18nAttrSnapshot = JSON.stringify(snap);
  }

  Object.entries(spec).forEach(([attr, key]) => {
    const val = resolveAttrValue(key, locale);
    if (val != null) el.setAttribute(attr, val);
  });
}

function applyTextElement(el, locale) {
  if (locale === 'fr') {
    if (el.dataset.i18nDefault != null) el.textContent = el.dataset.i18nDefault;
    return;
  }
  const key = el.getAttribute('data-i18n');
  const val = siteT(key, locale);
  if (val != null) el.textContent = val;
}

function applyHtmlElement(el, locale) {
  if (locale === 'fr') {
    if (el.dataset.i18nDefaultHtml != null) el.innerHTML = el.dataset.i18nDefaultHtml;
    return;
  }
  const key = el.getAttribute('data-i18n-html');
  const val = siteT(key, locale);
  if (val != null) el.innerHTML = val;
}

function applyMeta(locale) {
  const pageId = getPageId();
  if (locale === 'fr') {
    if (defaultTitle) document.title = defaultTitle;
    const meta = document.querySelector('meta[name="description"]');
    if (meta && defaultDescription) meta.setAttribute('content', defaultDescription);
    return;
  }
  const title = siteT(`meta.${pageId}.title`, locale);
  const desc = siteT(`meta.${pageId}.description`, locale);
  if (title) document.title = title;
  const meta = document.querySelector('meta[name="description"]');
  if (meta && desc) meta.setAttribute('content', desc);
}

export function snapshotDefaults() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    if (el.dataset.i18nDefault == null) {
      el.dataset.i18nDefault = el.textContent;
    }
  });
  document.querySelectorAll('[data-i18n-html]').forEach((el) => {
    if (el.dataset.i18nDefaultHtml == null) {
      el.dataset.i18nDefaultHtml = el.innerHTML;
    }
  });
  document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
    if (el.dataset.i18nDefaultAttr == null) {
      el.dataset.i18nDefaultAttr = el.getAttribute('data-i18n-attr');
    }
  });
  defaultTitle = document.title;
  defaultDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
}

export function applySiteLocale(locale) {
  activeLocale = locale;

  document.querySelectorAll('[data-i18n]').forEach((el) => applyTextElement(el, locale));
  document.querySelectorAll('[data-i18n-html]').forEach((el) => applyHtmlElement(el, locale));
  document.querySelectorAll('[data-i18n-attr]').forEach((el) => applyAttrElement(el, locale));

  applyMeta(locale);

  document.dispatchEvent(
    new CustomEvent(LOCALE_EVENT, { detail: { locale } }),
  );
  refreshFooterMaillageForLocale();
}

export function refreshFooterMaillageForLocale() {
  document.querySelectorAll('.footer-semantic').forEach((el) => el.remove());
  injectFooterMaillage();
}

export function initSiteI18n(store) {
  snapshotDefaults();
  applySiteLocale(store.locale || getLocale());

  let syncedLocale = store.locale;
  return store.subscribe(() => {
    if (store.locale === syncedLocale) return;
    syncedLocale = store.locale;
    applySiteLocale(store.locale);
  });
}
