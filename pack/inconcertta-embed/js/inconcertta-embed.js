/**
 * InConcertta — embed inline + plein écran (autonome, sans dépendance i18n).
 *
 * Prérequis HTML :
 *   #inconcertta-live-embed[data-project="UUID"]
 *   #inconcertta-embed-expand
 *   iframe enfant (sans src initial — chargé au scroll ou au clic Agrandir)
 *
 * Usage :
 *   import { initInconcerttaEmbed } from './inconcertta-embed.js';
 *   initInconcerttaEmbed();
 *
 * Optionnel sur le bouton :
 *   data-label-expand="Agrandir" data-label-close="Fermer"
 *   data-aria-expand="…" data-aria-close="…"
 */

const ORIGIN = 'https://inconcertta.fr';
const PROJECT_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}(?:-[0-9a-f]{12})?$/i;

function buildEmbedSrc(projectId) {
  const params = new URLSearchParams({ ref: 'embed' });
  const from = window.location.hostname || '';
  if (from) params.set('from', from);
  return `${ORIGIN}/embed/p/${projectId}?${params}`;
}

function updateExpandButton(expandBtn, expanded) {
  if (!expandBtn) return;
  expandBtn.setAttribute('aria-pressed', expanded ? 'true' : 'false');
  expandBtn.textContent = expanded
    ? (expandBtn.dataset.labelClose || 'Fermer')
    : (expandBtn.dataset.labelExpand || 'Agrandir');
  expandBtn.setAttribute(
    'aria-label',
    expanded
      ? (expandBtn.dataset.ariaClose || 'Fermer le plein écran')
      : (expandBtn.dataset.ariaExpand || 'Agrandir en plein écran'),
  );
}

export function initInconcerttaEmbed(options = {}) {
  const host = document.getElementById(options.hostId || 'inconcertta-live-embed');
  const iframe = host?.querySelector('iframe');
  const expandBtn = document.getElementById(options.buttonId || 'inconcertta-embed-expand');
  if (!host || !iframe || !expandBtn) return;

  const projectId = (host.dataset.project || '').trim();
  if (!PROJECT_ID_RE.test(projectId)) {
    console.warn('[InConcertta embed] data-project invalide sur #inconcertta-live-embed');
    return;
  }

  let embedAnchor = null;

  const load = () => {
    if (iframe.dataset.embedLoaded) return;
    iframe.dataset.embedLoaded = '1';
    iframe.src = buildEmbedSrc(projectId);
  };

  const setExpanded = (expanded) => {
    if (expanded) {
      if (!embedAnchor) {
        embedAnchor = document.createComment('inconcertta-embed-anchor');
        host.parentNode.insertBefore(embedAnchor, host);
      }
      document.body.appendChild(host);
      host.classList.add('is-fullscreen');
      document.body.classList.add('demo-embed-fullscreen');
      document.documentElement.classList.add('demo-embed-fullscreen');
      window.__lenis?.stop();
    } else {
      host.classList.remove('is-fullscreen');
      if (embedAnchor?.parentNode) {
        embedAnchor.parentNode.insertBefore(host, embedAnchor.nextSibling);
      }
      document.body.classList.remove('demo-embed-fullscreen');
      document.documentElement.classList.remove('demo-embed-fullscreen');
      window.__lenis?.start();
    }
    updateExpandButton(expandBtn, expanded);
  };

  expandBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (host.classList.contains('is-fullscreen')) {
      setExpanded(false);
      return;
    }
    load();
    setExpanded(true);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && host.classList.contains('is-fullscreen')) {
      e.preventDefault();
      setExpanded(false);
    }
  });

  const loadTriggers = new Set(options.loadHashes || ['#demo-inconcertta', '#demo-live']);

  const shouldLoad = () => loadTriggers.has(window.location.hash);
  if (shouldLoad()) load();

  window.addEventListener('hashchange', () => {
    if (shouldLoad()) load();
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          load();
          observer.disconnect();
        }
      },
      { rootMargin: options.rootMargin || '120px 0px' },
    );
    observer.observe(host);
    return;
  }

  load();
}
