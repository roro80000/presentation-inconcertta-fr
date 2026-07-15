/**
 * Consentement cookies — presentation.inconcertta.fr
 */

export const CONSENT_KEY = 'presentation_ic_cookie_consent';
export const CONSENT_VERSION = '1.0';

export function getCookieConsent() {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const consent = JSON.parse(raw);
    if (!consent?.version || typeof consent.timestamp !== 'number') return null;
    return consent;
  } catch {
    return null;
  }
}

export function needsConsentBanner() {
  const consent = getCookieConsent();
  if (!consent) return true;
  return consent.version !== CONSENT_VERSION;
}

export function hasConsentFor(category) {
  const consent = getCookieConsent();
  if (!consent) return category === 'essential';
  return consent[category] === true;
}

function applyGtagConsent(consent) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  const gtag =
    typeof window.gtag === 'function'
      ? window.gtag
      : function gtag() {
          window.dataLayer.push(arguments);
        };
  window.gtag = gtag;
  gtag('consent', 'update', {
    analytics_storage: consent.analytics ? 'granted' : 'denied',
    ad_storage: consent.marketing ? 'granted' : 'denied',
  });
}

export function applyConsentSettings(consent) {
  if (typeof window === 'undefined') return;
  window.__siteCookieConsent = consent;
  applyGtagConsent(consent);
  window.dispatchEvent(new CustomEvent('site-cookie-consent', { detail: consent }));
}

export function setCookieConsent(categories) {
  const consent = {
    version: CONSENT_VERSION,
    essential: true,
    analytics: categories.includes('analytics'),
    marketing: categories.includes('marketing'),
    timestamp: Date.now(),
    lastUpdated: new Date().toISOString(),
  };
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
  } catch (err) {
    console.warn('[cookie-consent] Impossible de sauvegarder:', err);
  }
  applyConsentSettings(consent);
  return consent;
}

export function initConsentDefaults() {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = window.gtag || gtag;
  window.gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    wait_for_update: 500,
  });

  const existing = getCookieConsent();
  if (existing) applyConsentSettings(existing);
}
