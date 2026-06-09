import { injectSchemaLd } from './schema-ld.js';
import { injectFooterMaillage } from './footer-maillage.js';
import { injectFooterLinkedIn } from './footer-linkedin.js';

function shouldInjectSeo() {
  const robots = document.querySelector('meta[name="robots"]')?.content?.toLowerCase() ?? '';
  return !robots.includes('noindex');
}

injectFooterLinkedIn();

if (shouldInjectSeo()) {
  injectSchemaLd();
  injectFooterMaillage();
}
