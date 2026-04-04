/**
 * Visionneuse démo InConcertta (interface + captures).
 * Carrousel automatique toutes les 3 s jusqu’au premier clic / toucher sur la zone démo ;
 * alors arrêt, retour à la vue principale, navigation manuelle.
 */

const CAPTURE_BASE = '/assets/Inconcertta/captures/';
const MAIN_BG_LIGHT = '/assets/Inconcertta/pageprincipale.png';
const MAIN_BG_DARK = '/assets/Inconcertta/pageprincipale-dark.png';
const INCONCERTTA_LOGIN_URL = 'https://inconcertta.fr/login';

const CAROUSEL_INTERVAL_MS = 3000;
/** Ordre de défilement : vue principale (index 0) puis les outils. */
const CAROUSEL_TOOL_ORDER = ['forum', 'sondages', 'idees', 'actualites', 'carte', 'evolutions', 'mon-compte'];

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

  let carouselTimer = null;
  let carouselNextIndex = 1;
  let userDismissedCarousel = false;

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

  function stopAutoCarousel() {
    if (carouselTimer != null) {
      window.clearInterval(carouselTimer);
      carouselTimer = null;
    }
  }

  function carouselSlideCount() {
    return 1 + CAROUSEL_TOOL_ORDER.length;
  }

  function runCarouselTick() {
    if (userDismissedCarousel || viewMain.hidden) return;

    if (carouselNextIndex === 0) {
      goMainMap();
    } else {
      const slug = CAROUSEL_TOOL_ORDER[carouselNextIndex - 1];
      const hit = viewportFrame.querySelector(`.demo-hit[data-tool="${slug}"]`);
      openTool(slug, hit?.getAttribute('data-label') || slug);
    }
    carouselNextIndex = (carouselNextIndex + 1) % carouselSlideCount();
  }

  function startAutoCarousel() {
    if (userDismissedCarousel) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    stopAutoCarousel();
    demoDarkMode = false;
    goMainMap();
    carouselNextIndex = 1;
    carouselTimer = window.setInterval(runCarouselTick, CAROUSEL_INTERVAL_MS);
  }

  function dismissCarouselFromViewport() {
    if (userDismissedCarousel) return;
    userDismissedCarousel = true;
    stopAutoCarousel();
    goMainMap();
  }

  function handleViewportHit(hit) {
    if (hit.id === 'hit-logo') {
      goMainMap();
      return;
    }
    if (hit.id === 'hit-logout') {
      triggerLogoutConfirm();
      return;
    }
    const slug = hit.getAttribute('data-tool');
    if (slug === 'theme') {
      toggleThemeDemo();
      return;
    }
    if (slug) {
      openTool(slug, hit.getAttribute('data-label'));
    }
  }

  hitLogin.addEventListener('click', showMain);
  hitLogin.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    showMain();
  });

  /* Aucun pointerdown ici : avec trackpad, pointerType reste souvent « mouse » et preventDefault cassait scroll / Lenis. */
  viewportFrame.addEventListener('wheel', dismissCarouselFromViewport, { capture: true, passive: true });
  viewportFrame.addEventListener('touchmove', dismissCarouselFromViewport, { capture: true, passive: true });

  viewportFrame.addEventListener(
    'click',
    (e) => {
      if (!userDismissedCarousel) {
        dismissCarouselFromViewport();
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return;
      }

      const hit = e.target.closest('.demo-hit');
      if (!hit || !viewportFrame.contains(hit)) return;
      handleViewportHit(hit);
    },
    true
  );

  viewportFrame.addEventListener(
    'keydown',
    (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const hit = e.target.closest('.demo-hit');
      if (!hit || !viewportFrame.contains(hit)) return;
      e.preventDefault();
      if (!userDismissedCarousel) {
        dismissCarouselFromViewport();
        return;
      }
      handleViewportHit(hit);
    },
    true
  );

  function applyDemoHash() {
    const h = window.location.hash;
    if (h === '#demo-main' || h === '#main') showMain();
  }
  applyDemoHash();
  window.addEventListener('hashchange', applyDemoHash);

  showMain();
  startAutoCarousel();
}
