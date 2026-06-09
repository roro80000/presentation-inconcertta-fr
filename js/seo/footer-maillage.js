import {
  NATIONAL_FOOTER_LINKS,
  THEMATIC_FOOTER_SECTIONS,
  SERVICES,
  serviceUrl,
} from './seo-data.js';
import { siteT } from '../i18n/site-i18n.js';
import { getLocale } from '../accessibility/strings.js';

function t(key) {
  const loc = getLocale();
  if (loc === 'fr') return null;
  return siteT(key, loc);
}

function label(key, fallback) {
  return t(key) ?? fallback;
}

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else node.setAttribute(k, v);
  });
  children.forEach((c) => {
    if (typeof c === 'string') node.appendChild(document.createTextNode(c));
    else if (c) node.appendChild(c);
  });
  return node;
}

function linkLi(href, labelText, external = false) {
  const a = { href, text: labelText };
  if (external) {
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  }
  return el('li', {}, [el('a', a)]);
}

/** Panneau repliable (SEO — fermé par défaut). */
function buildLinkPanel(summaryText, links) {
  const details = el('details', { class: 'footer-semantic__panel' });
  details.appendChild(el('summary', { class: 'footer-semantic__summary', text: summaryText }));

  const body = el('div', { class: 'footer-semantic__panel-body' });
  const ul = el('ul', { class: 'footer-semantic__links' });
  links.forEach(({ href, label: linkLabel, external }) => {
    ul.appendChild(linkLi(serviceUrl(href), linkLabel, external));
  });
  body.appendChild(ul);
  details.appendChild(body);
  return details;
}

/** Pied de page léger (toutes les pages indexables sauf maillage complet sur mentions). */
export function buildFooterMaillageSoft() {
  const nav = el('nav', {
    class: 'footer-semantic footer-semantic--soft',
    'aria-label': label('shared.footer.semantic.softAria', 'Navigation InConcertta — concertation numérique'),
  });

  const ul = el('ul', { class: 'footer-semantic-soft__links' });
  const items = [
    { href: SERVICES.accueil.path, key: 'shared.footer.semantic.presentation', fallback: 'Présentation' },
    { href: SERVICES.gestion.path, key: 'shared.footer.semantic.management', fallback: 'Interface de gestion' },
    { href: SERVICES.contact.path, key: 'shared.footer.semantic.contact', fallback: 'Contact' },
    { href: SERVICES.mentions.path, key: 'shared.footer.semantic.legal', fallback: 'Mentions légales' },
    {
      href: 'mentions-legales.html#maillage-semantique-annexe',
      key: 'shared.footer.semantic.plan',
      fallback: 'Plan du site',
    },
  ];

  items.forEach(({ href, key, fallback }, i) => {
    if (i > 0) {
      ul.appendChild(
        el('li', { class: 'footer-semantic-soft__sep', 'aria-hidden': 'true', text: '·' }),
      );
    }
    ul.appendChild(linkLi(serviceUrl(href), label(key, fallback)));
  });

  nav.appendChild(ul);
  return nav;
}

const THEMATIC_SECTION_KEYS = [
  'shared.footer.semantic.thematic.participation',
  'shared.footer.semantic.thematic.features',
  'shared.footer.semantic.thematic.pages',
];

const THEMATIC_LINK_KEY_BASE = 'shared.footer.semantic.thematic.';

/** Maillage complet (mentions légales) — listes déroulantes, repliées par défaut. */
export function buildFooterMaillage() {
  const nav = el('nav', {
    class: 'footer-semantic footer-semantic--full',
    id: 'maillage-semantique-annexe',
    'aria-label': label('shared.footer.semantic.fullAria', 'Plan du site — maillage sémantique InConcertta'),
  });

  nav.appendChild(
    el('p', {
      class: 'footer-semantic__title',
      text: label('shared.footer.semantic.siteMap', 'Plan du site'),
    }),
  );

  const panels = el('div', { class: 'footer-semantic__panels' });

  panels.appendChild(
    buildLinkPanel(
      label('shared.footer.semantic.panel.france', 'France — plateforme de concertation numérique'),
      NATIONAL_FOOTER_LINKS.map((link, i) => ({
        ...link,
        label: label(`shared.footer.semantic.national.${i}`, link.label),
      })),
    ),
  );

  THEMATIC_FOOTER_SECTIONS.forEach((section, si) => {
    let linkOffset = si === 0 ? 0 : si === 1 ? 5 : 10;
    panels.appendChild(
      buildLinkPanel(
        label(THEMATIC_SECTION_KEYS[si], section.title),
        section.links.map((link, li) => ({
          ...link,
          label: label(`${THEMATIC_LINK_KEY_BASE}${linkOffset + li}`, link.label),
        })),
      ),
    );
  });

  panels.appendChild(
    buildLinkPanel(label('shared.footer.semantic.panel.mainPages', 'Pages principales'), [
      { href: '/', label: label('shared.footer.semantic.link.presentationFull', 'Présentation — plateforme de concertation') },
      { href: 'gestion.html', label: label('shared.footer.semantic.link.managementFull', 'Interface de gestion') },
      { href: 'contact.html', label: label('shared.footer.semantic.link.contactFull', 'Contact et informations') },
      { href: 'mentions-legales.html', label: label('shared.footer.semantic.link.legalFull', 'Mentions légales') },
    ]),
  );

  nav.appendChild(panels);
  return nav;
}

export function isMentionsLegalesPage() {
  const path = (window.location.pathname || '').toLowerCase();
  return (
    path.endsWith('mentions-legales.html') ||
    path.endsWith('/mentions-legales') ||
    path.endsWith('/mentions-legales/')
  );
}

export function injectFooterMaillage() {
  const footer = document.querySelector('.footer--presentation .container');
  if (!footer || footer.querySelector('.footer-semantic')) return;

  const block = isMentionsLegalesPage() ? buildFooterMaillage() : buildFooterMaillageSoft();

  footer.insertBefore(block, footer.firstElementChild);
}
