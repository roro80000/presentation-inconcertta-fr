/**
 * Formulaire contact — consentement RGPD, bouton actif si valide,
 * soumission native Netlify Forms avec redirection vers merci.html.
 */

function isContactFormComplete(form) {
  const consent = form.elements.namedItem('consentData');
  const consentOk = consent instanceof HTMLInputElement && consent.checked;
  return form.checkValidity() && consentOk;
}

function updateSubmitState(form) {
  const submitBtn = document.getElementById('submitBtn');
  if (!submitBtn) return;

  const complete = isContactFormComplete(form);
  submitBtn.disabled = !complete;
  submitBtn.classList.toggle('is-ready', complete);
  submitBtn.classList.toggle('is-pending', !complete);
  submitBtn.setAttribute('aria-disabled', complete ? 'false' : 'true');

  // Forcer l'opacité et le curseur pour rendre l'état clair et accessible.
  submitBtn.style.opacity = complete ? '1' : '0.42';
  submitBtn.style.cursor = complete ? 'pointer' : 'not-allowed';
}


function bindContactForm(form) {
  const refresh = () => updateSubmitState(form);

  form.addEventListener('input', refresh);
  form.addEventListener('change', refresh);
  form.addEventListener('invalid', refresh, true);

  form.addEventListener('submit', (e) => {
    refresh();
    if (!isContactFormComplete(form)) {
      e.preventDefault();
      form.reportValidity();
    }
  });

  document.addEventListener('inconcertta:localechange', refresh);
  refresh();
}

export function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  if (form.dataset.contactFormBound !== '1') {
    form.dataset.contactFormBound = '1';
    bindContactForm(form);
  } else {
    updateSubmitState(form);
  }
}
