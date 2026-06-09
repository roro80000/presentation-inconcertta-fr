/** Données sémantiques — presentation.inconcertta.fr (InConcertta, France). */

export const SITE_ORIGIN = 'https://presentation.inconcertta.fr';

export const APP_URL = 'https://inconcertta.fr/';
export const INCITTA_URL = 'https://www.incitta.eu/';

export const ORG = {
  id: `${SITE_ORIGIN}/#org`,
  name: 'InCitta',
  legalName: 'InCitta SASU',
  email: 'contact@incitta.eu',
  address: {
    streetAddress: '26 rue Jean-Baptiste Trannoy',
    postalCode: '80000',
    addressLocality: 'Amiens',
    addressRegion: 'Hauts-de-France',
    addressCountry: 'FR',
  },
};

export const PRODUCT = {
  id: `${SITE_ORIGIN}/#product`,
  name: 'InConcertta',
  alternateName: [
    'Logiciel de concertation InConcertta',
    'Plateforme de budget participatif InConcertta',
  ],
};

/** Pages indexables du site de présentation (maillage interne). */
export const SERVICES = {
  accueil: {
    key: 'accueil',
    path: '/',
    name: 'Logiciel de concertation et budget participatif',
    serviceTypes: [
      'Plateforme de concertation numérique',
      'Logiciel de budget participatif',
      'Consultation citoyenne en ligne',
      'E-démocratie',
      'Démocratie participative',
    ],
    short: 'concertation numérique',
    national: true,
  },
  gestion: {
    key: 'gestion',
    path: 'gestion.html',
    name: 'Interface de gestion InConcertta',
    serviceTypes: [
      'Pilotage de concertation en ligne',
      'Administration plateforme participative',
      'Outil de gestion budget participatif',
    ],
    short: 'interface de gestion',
    national: true,
  },
  contact: {
    key: 'contact',
    path: 'contact.html',
    name: 'Contact et demande d’informations',
    serviceTypes: [
      'Demande d’informations logiciel de concertation',
      'Déploiement plateforme participative',
    ],
    short: 'contact',
    national: true,
  },
  mentions: {
    key: 'mentions',
    path: 'mentions-legales.html',
    name: 'Mentions légales',
    serviceTypes: ['Informations légales éditeur InConcertta'],
    short: 'mentions légales',
    national: true,
  },
};

export const FRANCE_AREA = { '@type': 'Country', name: 'France', identifier: 'FR' };

/** Liens nationaux (ancres : plateforme, e-démocratie, concertation en ligne). */
export const NATIONAL_FOOTER_LINKS = [
  { href: '/', label: 'Plateforme de concertation numérique — France' },
  { href: '/', label: 'Logiciel de budget participatif pour collectivités' },
  { href: '/', label: 'Consultation citoyenne en ligne' },
  { href: '/', label: 'E-démocratie et participation citoyenne' },
  { href: 'gestion.html', label: 'Interface de gestion — concertation en ligne' },
  { href: 'contact.html', label: 'Concertation numérique — nous contacter' },
];

/** Maillage thématique complet (mentions légales uniquement). */
export const THEMATIC_FOOTER_SECTIONS = [
  {
    title: 'Concertation & participation',
    links: [
      { href: '/', label: 'Plateforme de concertation numérique' },
      { href: '/#nouvelle-facon-concerter', label: 'Concertation citoyenne en ligne' },
      { href: '/#cas-usage', label: 'Budget participatif et consultation citoyenne' },
      { href: '/#concretement-inconcertta', label: 'E-démocratie pour collectivités' },
      { href: '/#limites-concertation-classique', label: 'Démocratie participative territoriale' },
    ],
  },
  {
    title: 'Fonctionnalités & pilotage',
    links: [
      { href: 'gestion.html', label: 'Interface de gestion — pilotage concertation' },
      { href: '/#fonctions-title', label: 'Carte interactive et modélisation participative' },
      { href: '/#resultats-concrets', label: 'Sondages, idées et analyses' },
      { href: '/#fiabilite-collectivites', label: 'Plateforme RGPD — hébergement UE' },
      { href: '/#offre-inconcertta-title', label: 'Déploiement plateforme participative' },
    ],
  },
  {
    title: 'Pages & éditeur',
    links: [
      { href: 'contact.html', label: 'Demander des informations — InConcertta' },
      { href: 'mentions-legales.html', label: 'Mentions légales' },
      { href: APP_URL, label: 'Application InConcertta', external: true },
      { href: INCITTA_URL, label: 'InCitta — éditeur', external: true },
    ],
  },
];

export const SERVICE_PAGE_KEYS = ['accueil', 'gestion', 'contact'];

export function serviceUrl(path) {
  if (!path || path === '/') return `${SITE_ORIGIN}/`;
  if (path.startsWith('http')) return path;
  const [pathname, hash] = path.split('#');
  const base = `${SITE_ORIGIN}/${pathname.replace(/^\//, '')}`;
  return hash ? `${base}#${hash}` : base;
}

export function allServiceKeys() {
  return SERVICE_PAGE_KEYS;
}
