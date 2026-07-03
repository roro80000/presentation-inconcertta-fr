/**
 * Fond diapo fixe + grain SVG (pointer-events: none).
 */

export function injectGrain() {
  if (!document.getElementById('site-diapo-backdrop')) {
    const backdrop = document.createElement('div');
    backdrop.id = 'site-diapo-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(backdrop, document.body.firstChild);
  }

  if (document.getElementById('lux-grain')) return;

  const g = document.createElement('div');
  g.id = 'lux-grain';
  g.setAttribute('aria-hidden', 'true');
  document.body.appendChild(g);
}
