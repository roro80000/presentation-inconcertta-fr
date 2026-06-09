import { shared } from './shared.js';
import { meta } from './meta.js';
import { demo } from './demo.js';
import { indexPage } from './index-page.js';
import { gestion } from './gestion.js';
import { contact } from './contact.js';
import { merci } from './merci.js';
import { mentions } from './mentions.js';

const LOCALES = ['en', 'es', 'it'];

function mergeBundles(...bundles) {
  const result = { en: {}, es: {}, it: {} };
  for (const bundle of bundles) {
    for (const loc of LOCALES) {
      if (bundle[loc]) Object.assign(result[loc], bundle[loc]);
    }
  }
  return result;
}

export const TRANSLATIONS = mergeBundles(
  shared,
  meta,
  demo,
  indexPage,
  gestion,
  contact,
  merci,
  mentions,
);
