/**
 * Bannière de consentement cookies — presentation.inconcertta.fr
 * UX calquée sur Mon-jeu-InConcertta, thème sombre teal + orange marque.
 */

import {
  needsConsentBanner,
  setCookieConsent,
  hasConsentFor,
  initConsentDefaults,
} from './utils/cookie-consent.js';
import { initGoatCounter } from './goatcounter.js';

const PRIVACY_HREF = 'mentions-legales.html#confidentialite';

const CookieIcon = () => `
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M18.2 5.2C16.4 3.1 13 2.2 10.2 3.4c-.9.4-1.9.3-2.5-.5-.5-.7-1.4-.9-1.8-.1l-.5 2.1C3.4 6.8 2.5 9.2 2.5 12 2.5 17.2 6.8 21.5 12 21.5s9.5-4.3 9.5-9.5c0-2.6-1-5-2.8-6.8Z" fill="currentColor" fill-opacity="0.14" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"/>
    <circle cx="8.5" cy="11" r="1.15" fill="currentColor"/>
    <circle cx="12.5" cy="15.2" r="0.95" fill="currentColor"/>
    <circle cx="15.2" cy="10" r="1.05" fill="currentColor"/>
    <circle cx="10.2" cy="8.2" r="0.8" fill="currentColor"/>
    <circle cx="16" cy="14.5" r="0.75" fill="currentColor"/>
  </svg>`;

const CheckIcon = () => `
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="m7.5 12.2 2.8 2.8L16.5 8.8" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

const SlidersIcon = () => `
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 7h16M4 12h10M4 17h7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <circle cx="18" cy="7" r="2" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity="0.15"/>
    <circle cx="14" cy="12" r="2" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity="0.15"/>
    <circle cx="13" cy="17" r="2" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity="0.15"/>
  </svg>`;

function activateAnalyticsIfAllowed() {
  if (hasConsentFor('analytics')) initGoatCounter();
}

function mountBanner() {
  const portal = document.createElement('div');
  portal.id = 'cookie-banner-portal';
  portal.dataset.cookieBanner = 'true';
  document.body.appendChild(portal);
  document.documentElement.classList.add('cookie-banner-open');

  let customMode = false;
  let selected = { essential: true, analytics: false, marketing: false };
  let processing = false;

  const close = () => {
    document.documentElement.classList.remove('cookie-banner-open');
    portal.remove();
  };

  const save = (categories) => {
    if (processing) return;
    processing = true;
    try {
      setCookieConsent(categories);
      activateAnalyticsIfAllowed();
      close();
    } finally {
      processing = false;
    }
  };

  const render = () => {
    portal.innerHTML = `
      <div class="site-cookie-overlay" data-action="essential" aria-hidden="true"></div>
      <div class="site-cookie-banner-wrap" data-theme="dark" role="dialog" aria-modal="true" aria-labelledby="site-cookie-title">
        <div class="site-cookie-banner-panel">
          <div class="site-cookie-accent" aria-hidden="true"></div>
          <div class="site-cookie-banner-inner">
            <div class="site-cookie-banner-header">
              <div class="site-cookie-banner-header__title-row">
                <div class="site-cookie-banner-icon">${CookieIcon()}</div>
                <h3 id="site-cookie-title" class="site-cookie-banner-title">Gestion des cookies</h3>
              </div>
              <p class="site-cookie-banner-description">
                Nous utilisons des cookies et des outils de mesure d’audience pour améliorer votre expérience.
                Les cookies essentiels sont nécessaires au fonctionnement du site.
                Les cookies analytiques nous aident à comprendre comment vous utilisez le site.
              </p>
            </div>

            ${
              customMode
                ? `
              <div class="site-cookie-details">
                <div class="site-cookie-details-title">${SlidersIcon()} Personnaliser mes choix</div>
                <div class="site-cookie-category site-cookie-category--disabled">
                  <label class="site-cookie-check site-cookie-check--checked site-cookie-check--disabled">
                    <input type="checkbox" checked disabled>
                    <span class="site-cookie-check__box" aria-hidden="true">${CheckIcon()}</span>
                  </label>
                  <div>
                    <span class="site-cookie-cat-name">Cookies essentiels <span class="site-cookie-badge site-cookie-badge--ess">Obligatoire</span></span>
                    <span class="site-cookie-cat-desc">Nécessaires au fonctionnement du site (toujours activés)</span>
                  </div>
                </div>
                <div class="site-cookie-category" data-toggle="analytics">
                  <label class="site-cookie-check${selected.analytics ? ' site-cookie-check--checked' : ''}">
                    <input type="checkbox" data-cat="analytics" ${selected.analytics ? 'checked' : ''}>
                    <span class="site-cookie-check__box" aria-hidden="true">${selected.analytics ? CheckIcon() : ''}</span>
                  </label>
                  <div>
                    <span class="site-cookie-cat-name">Cookies analytiques <span class="site-cookie-badge">Optionnel</span></span>
                    <span class="site-cookie-cat-desc">Mesure d’audience (GoatCounter / Google Analytics) et amélioration du service</span>
                  </div>
                </div>
              </div>`
                : ''
            }

            <div class="site-cookie-actions">
              ${
                customMode
                  ? `
                <button type="button" class="site-cookie-btn site-cookie-btn--primary" data-action="custom">${CheckIcon()} Enregistrer mes choix</button>
                <button type="button" class="site-cookie-btn site-cookie-btn--outline" data-action="back">Retour</button>`
                  : `
                <button type="button" class="site-cookie-btn site-cookie-btn--primary" data-action="all">${CheckIcon()} Accepter tout</button>
                <button type="button" class="site-cookie-btn site-cookie-btn--secondary" data-action="essential">Essentiels uniquement</button>
                <button type="button" class="site-cookie-btn site-cookie-btn--outline" data-action="custom-mode">${SlidersIcon()} Personnaliser</button>`
              }
            </div>

            <div class="site-cookie-footer">
              Pour plus d’informations, consultez notre
              <a href="${PRIVACY_HREF}">politique de confidentialité</a>.
            </div>
          </div>
        </div>
      </div>`;

    portal.querySelector('[data-action="all"]')?.addEventListener('click', () =>
      save(['essential', 'analytics']),
    );
    portal.querySelectorAll('[data-action="essential"]').forEach((el) =>
      el.addEventListener('click', () => save(['essential'])),
    );
    portal.querySelector('[data-action="custom-mode"]')?.addEventListener('click', () => {
      customMode = true;
      render();
    });
    portal.querySelector('[data-action="back"]')?.addEventListener('click', () => {
      customMode = false;
      render();
    });
    portal.querySelector('[data-action="custom"]')?.addEventListener('click', () => {
      const cats = ['essential'];
      if (selected.analytics) cats.push('analytics');
      save(cats);
    });
    portal.querySelector('[data-toggle="analytics"]')?.addEventListener('click', (e) => {
      if (e.target.closest('a')) return;
      selected.analytics = !selected.analytics;
      render();
    });
  };

  render();
}

export function initCookieBanner() {
  initConsentDefaults();
  if (!needsConsentBanner()) {
    activateAnalyticsIfAllowed();
    return;
  }
  mountBanner();
}
