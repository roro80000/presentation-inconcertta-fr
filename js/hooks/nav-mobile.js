/**
 * Menu burger, fermeture (lien, extérieur, resize, swipe, Échap).
 */

let hamburger = null;
let navMenu = null;
let touchStartY = 0;
let touchEndY = 0;

function handleSwipe() {
  const swipeThreshold = 50;
  const diff = touchStartY - touchEndY;
  if (
    diff > swipeThreshold &&
    navMenu &&
    hamburger &&
    navMenu.classList.contains('active')
  ) {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
}

export function initNavMobile() {
  hamburger = document.querySelector('.hamburger');
  navMenu = document.querySelector('.nav-menu');

  if (!hamburger || !navMenu) {
    return;
  }

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    const expanded = navMenu.classList.contains('active');
    hamburger.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    document.body.style.overflow = expanded ? 'hidden' : 'auto';
  });

  hamburger.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      hamburger.click();
    }
  });

  document.querySelectorAll('.nav-link').forEach((n, index) => {
    n.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
      document.body.style.overflow = 'auto';
    });
    n.style.setProperty('--i', index);
  });

  document.addEventListener('click', (e) => {
    const a11yRoot = document.getElementById('incitta-a11y-root');
    if (
      hamburger &&
      navMenu &&
      !hamburger.contains(e.target) &&
      !navMenu.contains(e.target) &&
      !a11yRoot?.contains(e.target)
    ) {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  });

  window.addEventListener('resize', () => {
    if (hamburger && navMenu && window.innerWidth > 600) {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  });

  document.addEventListener('touchstart', (e) => {
    touchStartY = e.changedTouches[0].screenY;
  });

  document.addEventListener('touchend', (e) => {
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const a11yDrawer = document.querySelector('.incitta-a11y-drawer--open');
    if (a11yDrawer) return;
    if (navMenu && hamburger && navMenu.classList.contains('active')) {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
      document.body.style.overflow = 'auto';
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });
}
