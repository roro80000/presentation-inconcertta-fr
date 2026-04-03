/**
 * Visionneuse démo InConcertta (login → interface → captures).
 * Aligné sur Site_InCitta/js/pages/inconcertta-demo.js — chemins /assets/Inconcertta/.
 */

const CAPTURE_BASE = '/assets/Inconcertta/captures/';
const MAIN_BG_LIGHT = '/assets/Inconcertta/pageprincipale.png';
const MAIN_BG_DARK = '/assets/Inconcertta/pageprincipale-dark.png';
const INCONCERTTA_LOGIN_URL = 'https://inconcertta.fr/login';

const LOGOUT_CONFIRM_MSG =
  'Quitter la démonstration et ouvrir la page de connexion InConcertta (inconcertta.fr) dans cet onglet ?';

const captureFile = {
  forum: 'forum.png',
  sondages: 'sondages.png',
  idees: 'idees.png',
  actualites: 'actualites.png',
  carte: 'carte.png',
  evolutions: 'evolutions.png',
  'mon-compte': 'mon-compte.png',
};

export function initInconcerttaDemo() {
  const viewLogin = document.getElementById('view-login');
  const viewMain = document.getElementById('view-main');
  const viewportFrame = document.getElementById('demo-viewport-frame');
  const viewportImg = document.getElementById('demo-viewport-img');
  const captionEl = document.getElementById('demo-viewport-caption');
  const hitLogin = document.getElementById('hit-login');

  if (!viewLogin || !hitLogin || !viewMain || !viewportFrame || !viewportImg) {
    return;
  }

  let demoDarkMode = false;
  let openToolSlug = null;
  let openToolLabel = null;

  function useDarkAssets() {
    return demoDarkMode;
  }

  function capturePath(slug) {
    const file = captureFile[slug];
    if (!file) return '';
    return CAPTURE_BASE + (useDarkAssets() ? 'dark/' : '') + file;
  }

  function applyViewport() {
    if (openToolSlug && captureFile[openToolSlug]) {
      viewportImg.src = capturePath(openToolSlug);
      viewportImg.alt = 'InConcertta — ' + (openToolLabel || openToolSlug);
      if (captionEl) {
        captionEl.hidden = false;
        captionEl.textContent = openToolLabel ? 'Affichage : ' + openToolLabel : '';
      }
    } else {
      openToolSlug = null;
      openToolLabel = null;
      viewportImg.src = useDarkAssets() ? MAIN_BG_DARK : MAIN_BG_LIGHT;
      viewportImg.alt = 'Interface principale InConcertta (illustration)';
      if (captionEl) {
        captionEl.hidden = true;
        captionEl.textContent = '';
      }
    }
  }

  function goMainMap() {
    openToolSlug = null;
    openToolLabel = null;
    applyViewport();
  }

  function openTool(slug, label) {
    if (!captureFile[slug]) return;
    openToolSlug = slug;
    openToolLabel = label;
    applyViewport();
  }

  function toggleThemeDemo() {
    demoDarkMode = !demoDarkMode;
    applyViewport();
  }

  function triggerLogoutConfirm() {
    if (window.confirm(LOGOUT_CONFIRM_MSG)) {
      window.location.assign(INCONCERTTA_LOGIN_URL);
    }
  }

  function showLogin() {
    demoDarkMode = false;
    goMainMap();
    viewLogin.hidden = false;
    viewMain.hidden = true;
  }

  function showMain() {
    demoDarkMode = false;
    goMainMap();
    viewLogin.hidden = true;
    viewMain.hidden = false;
  }

  hitLogin.addEventListener('click', showMain);

  viewportFrame.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn || !viewportFrame.contains(btn)) return;

    if (btn.id === 'hit-logo') {
      goMainMap();
      return;
    }
    if (btn.id === 'hit-logout') {
      triggerLogoutConfirm();
      return;
    }

    const slug = btn.getAttribute('data-tool');
    if (slug === 'theme') {
      toggleThemeDemo();
      return;
    }
    if (slug) {
      openTool(slug, btn.getAttribute('data-label'));
    }
  });

  function applyDemoHash() {
    const h = window.location.hash;
    if (h === '#demo-main' || h === '#main') showMain();
  }
  applyDemoHash();
  window.addEventListener('hashchange', applyDemoHash);
}
