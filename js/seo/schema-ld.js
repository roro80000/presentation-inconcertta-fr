import {
  SITE_ORIGIN,
  ORG,
  PRODUCT,
  SERVICES,
  FRANCE_AREA,
  APP_URL,
  INCITTA_URL,
  serviceUrl,
} from './seo-data.js';

const LOGO_URL = `${SITE_ORIGIN}/assets/images/logos/logo-inconcertta-og.webp`;

function getPageKind() {
  const path = (window.location.pathname || '/').toLowerCase();
  if (path.endsWith('contact.html') || path.endsWith('/contact')) return 'contact';
  if (path.endsWith('gestion.html') || path.endsWith('/gestion')) return 'gestion';
  if (path.endsWith('mentions-legales.html') || path.endsWith('/mentions-legales')) {
    return 'mentions';
  }
  if (path === '/' || path.endsWith('index.html') || path.endsWith('/index')) return 'accueil';
  return 'generic';
}

function organizationNode() {
  return {
    '@type': ['Organization', 'LocalBusiness', 'ProfessionalService'],
    '@id': ORG.id,
    name: ORG.name,
    legalName: ORG.legalName,
    description:
      'InCitta — éditeur du logiciel InConcertta. Solution numérique de concertation, consultation citoyenne et budget participatif pour les collectivités. Siège à Amiens ; déploiement sur l’ensemble du territoire français.',
    url: INCITTA_URL,
    logo: { '@type': 'ImageObject', url: LOGO_URL },
    image: LOGO_URL,
    email: ORG.email,
    priceRange: '€€',
    address: {
      '@type': 'PostalAddress',
      streetAddress: ORG.address.streetAddress,
      postalCode: ORG.address.postalCode,
      addressLocality: ORG.address.addressLocality,
      addressRegion: ORG.address.addressRegion,
      addressCountry: ORG.address.addressCountry,
    },
    geo: { '@type': 'GeoCoordinates', latitude: 49.8941, longitude: 2.2958 },
    areaServed: FRANCE_AREA,
    serviceArea: FRANCE_AREA,
    knowsAbout: [
      'Concertation citoyenne',
      'Budget participatif',
      'Consultation citoyenne',
      'Démocratie participative',
      'E-démocratie',
      'Diagnostic territorial',
      'Modélisation interactive',
      'Aménagement du territoire',
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'sales',
        email: ORG.email,
        availableLanguage: ['French'],
        areaServed: 'FR',
      },
    ],
    sameAs: [INCITTA_URL, APP_URL],
  };
}

function softwareApplicationNode() {
  return {
    '@type': 'SoftwareApplication',
    '@id': PRODUCT.id,
    name: PRODUCT.name,
    alternateName: PRODUCT.alternateName,
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'CivicTech',
    operatingSystem: 'Web (navigateur — Windows, macOS, Linux, iOS, Android)',
    description:
      'Logiciel SaaS de concertation, consultation citoyenne et budget participatif. Carte interactive, diagnostic territorial, sondages, idées, exports. RGPD, hébergement en Union européenne.',
    url: APP_URL,
    softwareVersion: '1.0',
    inLanguage: 'fr-FR',
    isAccessibleForFree: false,
    featureList: [
      'Carte interactive et modélisation participative',
      'Budget participatif (collecte, tri, vote, plafond budgétaire)',
      'Consultation citoyenne et sondages paramétrables',
      'Boîte à idées et forum modéré',
      'Espace collaboratif partenaires',
      'Analyses statistiques et exports',
      'Accessible mobile, tablette et ordinateur',
    ],
    audience: {
      '@type': 'Audience',
      audienceType:
        'Collectivités territoriales, EPCI, communes, métropoles, conseils départementaux et régionaux',
    },
    offers: {
      '@type': 'Offer',
      url: serviceUrl(SERVICES.contact.path),
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      areaServed: FRANCE_AREA,
    },
    provider: { '@id': ORG.id },
  };
}

function webSiteNode() {
  return {
    '@type': 'WebSite',
    '@id': `${SITE_ORIGIN}/#website`,
    url: `${SITE_ORIGIN}/`,
    name: 'InConcertta — logiciel de concertation et budget participatif',
    description:
      'Site de présentation d’InConcertta : plateforme de concertation numérique, consultation citoyenne et budget participatif pour les collectivités françaises.',
    inLanguage: 'fr-FR',
    publisher: { '@id': ORG.id },
  };
}

function breadcrumbFor(kind, pageUrl) {
  const items = [{ name: 'Accueil', item: `${SITE_ORIGIN}/` }];
  if (kind === 'gestion') {
    items.push({ name: 'Interface de gestion', item: pageUrl });
  } else if (kind === 'contact') {
    items.push({ name: 'Contact', item: pageUrl });
  } else if (kind === 'mentions') {
    items.push({ name: 'Mentions légales', item: pageUrl });
  }
  return {
    '@type': 'BreadcrumbList',
    '@id': `${pageUrl}#breadcrumb`,
    itemListElement: items.map((entry, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: entry.name,
      item: entry.item,
    })),
  };
}

function pageNode(kind, pageUrl) {
  const base = {
    '@id': `${pageUrl}#webpage`,
    url: pageUrl,
    isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
    inLanguage: 'fr-FR',
    publisher: { '@id': ORG.id },
  };

  if (kind === 'contact') {
    return {
      '@type': 'ContactPage',
      ...base,
      name: 'Contact InConcertta — informations et déploiement',
      description:
        'Formulaire pour demander des informations sur le logiciel de concertation et budget participatif InConcertta. Déployé partout en France.',
      about: { '@id': PRODUCT.id },
    };
  }

  if (kind === 'gestion') {
    return {
      '@type': 'WebPage',
      ...base,
      name: 'Interface de gestion — InConcertta',
      description:
        'Espace de gestion : paramétrage du projet, sondages, carte, idées, exports pour les collectivités.',
      about: { '@id': PRODUCT.id },
    };
  }

  if (kind === 'mentions') {
    return {
      '@type': 'WebPage',
      ...base,
      name: 'Mentions légales — Présentation InConcertta',
      description: 'Mentions légales du site presentation.inconcertta.fr — éditeur InCitta.',
    };
  }

  if (kind === 'accueil') {
    return {
      '@type': 'WebPage',
      '@id': `${SITE_ORIGIN}/#webpage`,
      url: `${SITE_ORIGIN}/`,
      name: 'InConcertta | Logiciel de Concertation & Budget Participatif',
      description:
        'Logiciel de concertation, consultation citoyenne et budget participatif pour les collectivités françaises.',
      isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
      about: { '@id': PRODUCT.id },
      primaryImageOfPage: { '@type': 'ImageObject', url: LOGO_URL },
      inLanguage: 'fr-FR',
      publisher: { '@id': ORG.id },
    };
  }

  return {
    '@type': 'WebPage',
    ...base,
    name: document.title || 'InConcertta',
  };
}

function faqNode() {
  return {
    '@type': 'FAQPage',
    '@id': `${SITE_ORIGIN}/#faq`,
    mainEntity: [
      {
        '@type': 'Question',
        name: "Qu'est-ce qu'InConcertta ?",
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'InConcertta est un logiciel SaaS de concertation, consultation citoyenne et budget participatif pour les collectivités, accessible en ligne sans installation.',
        },
      },
      {
        '@type': 'Question',
        name: 'InConcertta est-il disponible partout en France ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Oui. Solution entièrement numérique, déployée sans contrainte géographique pour toutes les collectivités françaises.',
        },
      },
      {
        '@type': 'Question',
        name: 'InConcertta couvre-t-il le budget participatif ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Oui : collecte des projets, tri, vote des habitants, règles paramétrables (plafond budgétaire, validation, ou les deux).',
        },
      },
      {
        '@type': 'Question',
        name: 'Les données sont-elles hébergées en Europe ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Oui. Conformité RGPD et hébergement dans l’Union européenne (infrastructure Supabase).',
        },
      },
    ],
  };
}

function digitalServiceNodes() {
  return Object.values(SERVICES)
    .filter((s) => s.key !== 'mentions')
    .map((svc) => ({
      '@type': 'Service',
      '@id': `${SITE_ORIGIN}/#service-${svc.key}`,
      name: svc.name,
      serviceType: svc.serviceTypes,
      url: serviceUrl(svc.path),
      provider: { '@id': ORG.id },
      areaServed: FRANCE_AREA,
      availableChannel: {
        '@type': 'ServiceChannel',
        serviceUrl: serviceUrl(svc.path),
        serviceType: 'Online',
      },
    }));
}

export function buildSchemaGraph(pageUrl) {
  const kind = getPageKind();
  const graph = [
    webSiteNode(),
    organizationNode(),
    softwareApplicationNode(),
    pageNode(kind, pageUrl),
    breadcrumbFor(kind, pageUrl),
    ...digitalServiceNodes(),
  ];

  if (kind === 'accueil') {
    graph.push(faqNode());
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}

export function injectSchemaLd() {
  if (document.querySelector('script[data-presentation-schema]')) return;

  const pageUrl = new URL(
    document.querySelector('link[rel="canonical"]')?.href || window.location.href,
    SITE_ORIGIN,
  ).href;

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-presentation-schema', 'graph');
  script.textContent = JSON.stringify(buildSchemaGraph(pageUrl));
  document.head.appendChild(script);
}
