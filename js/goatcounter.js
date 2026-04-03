/**
 * Mesure d’audience GoatCounter — tableau de bord dédié à la présentation.
 * (InCitta / incitta.eu utilise ronanottini.)
 */
export const GOATCOUNTER_SITE = 'presentation-inconcertta';

export function initGoatCounter() {
  const site = typeof GOATCOUNTER_SITE === 'string' ? GOATCOUNTER_SITE.trim() : '';
  if (!site) return;

  const endpoint = `https://${site}.goatcounter.com/count`;
  if (document.querySelector(`script[data-goatcounter="${endpoint}"]`)) return;

  const s = document.createElement('script');
  s.async = true;
  s.dataset.goatcounter = endpoint;
  s.src = 'https://gc.zgo.at/count.js';
  document.head.appendChild(s);
}
