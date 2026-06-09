/** Icône LinkedIn — coin bas-droit du pied de page (injection idempotente). */

const FOOTER_SELECTOR = '.footer--site, .footer--presentation';
const LINKEDIN_URL = 'https://fr.linkedin.com/company/incitta80';
const ICON_SRC = '/assets/Logo/LinkedIn_iconblue.webp';

export function injectFooterLinkedIn() {
  document.querySelectorAll(FOOTER_SELECTOR).forEach((footer) => {
    if (footer.querySelector('.footer-linkedin')) return;

    const link = document.createElement('a');
    link.className = 'footer-linkedin';
    link.href = LINKEDIN_URL;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', 'InCitta sur LinkedIn (nouvel onglet)');

    const icon = document.createElement('img');
    icon.className = 'footer-linkedin__icon';
    icon.src = ICON_SRC;
    icon.alt = '';
    icon.width = 48;
    icon.height = 48;
    icon.loading = 'lazy';
    icon.decoding = 'async';

    link.appendChild(icon);
    footer.appendChild(link);
  });
}
