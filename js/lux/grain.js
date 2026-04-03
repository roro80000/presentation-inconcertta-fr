/**
 * Overlay fixe de bruit SVG (grain argentique / papier), pointer-events: none.
 * L’intensité visuelle est pilotée par #lux-grain dans styles.css (opacité ~0.03).
 */

export function injectGrain() {
  if (document.getElementById('lux-grain')) return;
  const g = document.createElement('div');
  g.id = 'lux-grain';
  g.setAttribute('aria-hidden', 'true');
  document.body.appendChild(g);
}
