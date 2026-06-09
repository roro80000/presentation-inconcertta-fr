/**
 * Panneau accessibilité + bouton flottant demi-cercle (centre droit).
 */

import { LOCALE_FLAG_SVG } from './localeFlags.js';
import { FONT_SCALE_LARGE, FONT_SCALE_NORMAL, FONT_SCALE_XLARGE } from './accessibilityPrefs.js';
import { LINE_SPACING_LEVELS } from './applyA11yLiteracyEffects.js';
import { SUPPORTED_LOCALES, t } from './strings.js';
import { VOICE_PROFILES } from './ttsVoiceProfiles.js';

const ROOT_ID = 'incitta-a11y-root';
const FAB_ID = 'incitta-a11y-fab';
const PANEL_ID = 'incitta-a11y-panel';
const BACKDROP_ID = 'incitta-a11y-backdrop';

let panelOpen = false;
/** @type {HTMLElement | null} */
let previouslyFocused = null;

function el(tag, className, attrs = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const [key, val] of Object.entries(attrs)) {
    if (key === 'text') node.textContent = val;
    else if (key === 'html') node.innerHTML = val;
    else node.setAttribute(key, val);
  }
  return node;
}

function toggleSwitch(store, key, labelKey, descKey = '') {
  const wrap = el('label', 'incitta-a11y-toggle');
  const input = el('input', '', { type: 'checkbox', role: 'switch' });
  input.checked = Boolean(store.prefs[key]);
  input.addEventListener('change', () => store.togglePref(key));

  const text = el('span', 'incitta-a11y-toggle__text');
  const labelEl = el('span', 'incitta-a11y-toggle__label', { text: t(labelKey) });
  text.appendChild(labelEl);
  /** @type {HTMLElement | null} */
  let descEl = null;
  if (descKey) {
    descEl = el('span', 'incitta-a11y-toggle__desc', { text: t(descKey) });
    text.appendChild(descEl);
  }

  wrap.append(input, text);
  return {
    wrap,
    input,
    refreshLabels() {
      labelEl.textContent = t(labelKey);
      if (descEl) descEl.textContent = t(descKey);
    },
  };
}

function segmentControl(optionDefs, current, onSelect) {
  const group = el('div', 'incitta-a11y-segment', { role: 'group' });
  /** @type {HTMLButtonElement[]} */
  const buttons = [];

  optionDefs.forEach(({ value, labelKey }) => {
    const btn = /** @type {HTMLButtonElement} */ (el('button', 'incitta-a11y-segment__btn', {
      type: 'button',
      'aria-pressed': String(current === value),
    }));
    btn.textContent = t(labelKey);
    btn.addEventListener('click', () => onSelect(value));
    group.appendChild(btn);
    buttons.push(btn);
  });

  return {
    el: group,
    setValue(value) {
      buttons.forEach((btn, i) => {
        btn.setAttribute('aria-pressed', String(optionDefs[i].value === value));
      });
    },
    refreshLabels() {
      buttons.forEach((btn, i) => {
        btn.textContent = t(optionDefs[i].labelKey);
      });
    },
  };
}

function fieldLabel(key) {
  const node = el('p', 'incitta-a11y-field-label', { text: t(key) });
  return {
    el: node,
    refreshLabels() {
      node.textContent = t(key);
    },
  };
}

function sectionTitle(key) {
  const node = el('h3', 'incitta-a11y-section__title', { text: t(key) });
  return {
    el: node,
    refreshLabels() {
      node.textContent = t(key);
    },
  };
}

function refreshSelectOptions(select, optionDefs, selectedValue) {
  select.innerHTML = '';
  optionDefs.forEach(([value, labelKey]) => {
    const opt = el('option', '', { value, text: t(labelKey) });
    if (selectedValue === value) opt.selected = true;
    select.appendChild(opt);
  });
}

function localeControl(store) {
  const group = el('div', 'incitta-a11y-locale', {
    role: 'group',
    'aria-label': t('display.section.language'),
  });
  /** @type {HTMLButtonElement[]} */
  const buttons = [];

  SUPPORTED_LOCALES.forEach((loc) => {
    const btn = /** @type {HTMLButtonElement} */ (el('button', 'incitta-a11y-locale__btn', {
      type: 'button',
      'aria-pressed': String(store.locale === loc),
    }));
    btn.dataset.locale = loc;
    btn.innerHTML = `${LOCALE_FLAG_SVG[loc] ?? ''}<span class="incitta-a11y-locale__label">${t(`locale.${loc}`)}</span>`;
    btn.addEventListener('click', () => store.setLocale(loc));
    group.appendChild(btn);
    buttons.push(btn);
  });

  return {
    el: group,
    setValue(locale) {
      buttons.forEach((btn) => {
        btn.setAttribute('aria-pressed', String(btn.dataset.locale === locale));
      });
    },
    refreshLabels() {
      group.setAttribute('aria-label', t('display.section.language'));
      buttons.forEach((btn) => {
        const loc = btn.dataset.locale;
        const label = btn.querySelector('.incitta-a11y-locale__label');
        if (label && loc) label.textContent = t(`locale.${loc}`);
      });
    },
  };
}

function buildPanel(store) {
  const panel = el('aside', 'incitta-a11y-panel', {
    id: PANEL_ID,
    role: 'dialog',
    'aria-modal': 'true',
    'aria-label': t('display.title'),
  });

  const body = el('div', 'incitta-a11y-panel__body');

  const resetBtn = el('button', 'incitta-a11y-reset', { type: 'button', text: t('display.reset') });
  resetBtn.addEventListener('click', () => store.resetPrefs());

  /** @type {Array<{ refreshLabels: () => void }>} */
  const i18nNodes = [];

  const section = (headingKey) => {
    const title = sectionTitle(headingKey);
    i18nNodes.push(title);
    const sec = el('section', 'incitta-a11y-section');
    sec.appendChild(title.el);
    return sec;
  };

  const CB_OPTIONS = [
    ['off', 'display.colorBlindness.off'],
    ['protanopia', 'display.colorBlindness.protanopia'],
    ['deuteranopia', 'display.colorBlindness.deuteranopia'],
    ['tritanopia', 'display.colorBlindness.tritanopia'],
    ['achromatopsia', 'display.colorBlindness.achromatopsia'],
  ];

  const RATE_OPTIONS = [
    ['verySlow', 'display.tts.rate.verySlow'],
    ['slow', 'display.tts.rate.slow'],
    ['normal', 'display.tts.rate.normal'],
    ['fast', 'display.tts.rate.fast'],
  ];

  // Vision
  const vision = section('display.section.vision');
  const fontLabel = fieldLabel('display.fontScale.label');
  i18nNodes.push(fontLabel);
  const fontSeg = segmentControl(
    [
      { value: FONT_SCALE_NORMAL, labelKey: 'display.fontScale.normal' },
      { value: FONT_SCALE_LARGE, labelKey: 'display.fontScale.large' },
      { value: FONT_SCALE_XLARGE, labelKey: 'display.fontScale.xlarge' },
    ],
    store.prefs.fontScale,
    (v) => store.setPref('fontScale', v),
  );
  i18nNodes.push(fontSeg);
  vision.append(fontLabel.el, fontSeg.el);

  const togglesVision = [
    ['smartInvert', 'display.smartInvert', 'display.smartInvert.desc'],
    ['highContrast', 'display.highContrast', ''],
    ['linkHighlight', 'display.linkHighlight', ''],
    ['largeCursor', 'display.largeCursor', ''],
    ['dyslexia', 'display.dyslexia', ''],
  ];
  const visionInputs = togglesVision.map(([key, labelKey, descKey]) =>
    toggleSwitch(store, key, labelKey, descKey));
  visionInputs.forEach((item) => {
    i18nNodes.push(item);
    vision.appendChild(item.wrap);
  });

  const cbLabel = fieldLabel('display.colorBlindness.label');
  i18nNodes.push(cbLabel);
  const cbSelect = el('select', 'incitta-a11y-select', { 'aria-label': t('display.colorBlindness.label') });
  refreshSelectOptions(cbSelect, CB_OPTIONS, store.prefs.colorBlindness);
  cbSelect.addEventListener('change', () => store.setPref('colorBlindness', cbSelect.value));
  vision.append(cbLabel.el, cbSelect);

  // Lecture
  const reading = section('display.section.reading');
  const lineLabel = fieldLabel('display.lineSpacing.label');
  i18nNodes.push(lineLabel);
  const lineSeg = segmentControl(
    LINE_SPACING_LEVELS.map((lvl) => ({
      value: lvl,
      labelKey: `display.lineSpacing.${lvl === 'loose' ? 'loose' : lvl === 'extra' ? 'extra' : 'normal'}`,
    })),
    store.prefs.lineSpacing,
    (v) => store.setPref('lineSpacing', v),
  );
  i18nNodes.push(lineSeg);
  reading.append(lineLabel.el, lineSeg.el);

  // Motion
  const motion = section('display.section.motion');
  const motionDefs = [
    ['reduceMotion', 'display.reduceMotion', ''],
    ['motorAssist', 'display.motorAssist', ''],
    ['focusMode', 'display.focusMode', ''],
  ];
  const motionInputs = motionDefs.map(([key, labelKey, descKey]) =>
    toggleSwitch(store, key, labelKey, descKey));
  motionInputs.forEach((item) => {
    i18nNodes.push(item);
    motion.appendChild(item.wrap);
  });

  // Langue
  const langSec = section('display.section.language');
  const localeSeg = localeControl(store);
  i18nNodes.push(localeSeg);
  langSec.appendChild(localeSeg.el);

  // TTS
  const ttsTitle = sectionTitle('display.section.comprehension');
  i18nNodes.push(ttsTitle);
  const ttsSec = el('section', 'incitta-a11y-section');
  ttsSec.appendChild(ttsTitle.el);
  ttsSec.setAttribute('aria-label', t('display.tts.regionLabel'));
  const tts = store.tts;

  const ttsHint = el('p', 'incitta-a11y-hint', { text: t('display.tts.hint') });
  const ttsHintI18n = {
    refreshLabels() {
      ttsHint.textContent = t('display.tts.hint');
    },
  };
  i18nNodes.push(ttsHintI18n);

  const readBtn = el('button', 'incitta-a11y-segment__btn', {
    type: 'button',
    text: t('display.tts.readSelection'),
  });
  const stopBtn = el('button', 'incitta-a11y-segment__btn', { type: 'button', text: t('display.tts.stop') });
  const pauseBtn = el('button', 'incitta-a11y-segment__btn', { type: 'button', text: t('display.tts.pause') });

  readBtn.addEventListener('click', () => tts.readSelection());
  stopBtn.addEventListener('click', () => tts.stop());
  pauseBtn.addEventListener('click', () => {
    if (tts.state === 'paused') tts.resume();
    else tts.pause();
  });

  const rateLabel = fieldLabel('display.tts.rate.label');
  i18nNodes.push(rateLabel);
  const rateSelect = el('select', 'incitta-a11y-select', { 'aria-label': t('display.tts.rate.label') });
  refreshSelectOptions(rateSelect, RATE_OPTIONS, tts.rateKey);
  rateSelect.addEventListener('change', () => tts.setRate(rateSelect.value));

  const voiceLabel = fieldLabel('display.tts.voice.label');
  i18nNodes.push(voiceLabel);
  const voiceSelect = el('select', 'incitta-a11y-select', { 'aria-label': t('display.tts.voice.label') });
  const voiceOptions = VOICE_PROFILES.map((profile) => [profile, `display.tts.voice.${profile}`]);
  refreshSelectOptions(voiceSelect, voiceOptions, tts.voiceProfile);
  voiceSelect.addEventListener('change', () => tts.setVoiceProfile(voiceSelect.value));

  const ttsControls = el('div', 'incitta-a11y-tts-controls', { 'aria-label': t('display.tts.controlsLabel') });
  ttsControls.append(readBtn, pauseBtn, stopBtn);
  const ttsControlsI18n = {
    refreshLabels() {
      ttsControls.setAttribute('aria-label', t('display.tts.controlsLabel'));
    },
  };
  i18nNodes.push(ttsControlsI18n);

  /** @type {HTMLElement | null} */
  let ttsUnsupportedEl = null;
  if (!tts.supported) {
    ttsUnsupportedEl = el('p', 'incitta-a11y-hint incitta-a11y-hint--warn', { text: t('display.tts.unsupported') });
    ttsSec.appendChild(ttsUnsupportedEl);
    i18nNodes.push({
      refreshLabels() {
        if (ttsUnsupportedEl) ttsUnsupportedEl.textContent = t('display.tts.unsupported');
      },
    });
  } else {
    ttsSec.append(ttsHint, ttsControls);
    ttsSec.append(rateLabel.el, rateSelect, voiceLabel.el, voiceSelect);
  }

  body.append(vision, reading, motion, langSec, ttsSec, resetBtn);
  panel.append(body);

  const refreshAllLabels = () => {
    i18nNodes.forEach((node) => node.refreshLabels());
    refreshSelectOptions(cbSelect, CB_OPTIONS, store.prefs.colorBlindness);
    cbSelect.setAttribute('aria-label', t('display.colorBlindness.label'));
    if (tts.supported) {
      refreshSelectOptions(rateSelect, RATE_OPTIONS, tts.rateKey);
      rateSelect.setAttribute('aria-label', t('display.tts.rate.label'));
      refreshSelectOptions(voiceSelect, voiceOptions, tts.voiceProfile);
      voiceSelect.setAttribute('aria-label', t('display.tts.voice.label'));
    }
    ttsSec.setAttribute('aria-label', t('display.tts.regionLabel'));
  };

  return {
    panel,
    resetBtn,
    fontSeg,
    lineSeg,
    visionInputs,
    motionInputs,
    motionKeys: motionDefs.map(([key]) => key),
    togglesVision,
    cbSelect,
    localeSeg,
    pauseBtn,
    readBtn,
    stopBtn,
    refreshAllLabels,
  };
}

/** @param {ReturnType<import('./store.js').createAccessibilityStore>} store */
export function mountA11yUI(store) {
  if (document.getElementById(ROOT_ID)) {
    return { destroy() {} };
  }

  const root = el('div', 'incitta-a11y-root', { id: ROOT_ID });
  root.setAttribute('data-lenis-prevent', '');

  const backdrop = el('div', 'incitta-a11y-backdrop', { id: BACKDROP_ID, hidden: '' });

  const fab = el('button', 'incitta-a11y-fab', {
    id: FAB_ID,
    type: 'button',
    'aria-expanded': 'false',
    'aria-controls': PANEL_ID,
    'aria-label': t('display.openButton'),
  });
  fab.innerHTML = `
    <span class="incitta-a11y-fab__icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" focusable="false">
        <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 0 2h-1.07A7.001 7.001 0 0 1 13 22h-2a7.001 7.001 0 0 1-6.93-6H3a1 1 0 0 1 0-2h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2zM7 15a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>
      </svg>
    </span>`;

  const drawer = el('div', 'incitta-a11y-drawer');

  const {
    panel,
    resetBtn,
    fontSeg,
    lineSeg,
    visionInputs,
    motionInputs,
    motionKeys,
    togglesVision,
    cbSelect,
    localeSeg,
    pauseBtn,
    readBtn,
    stopBtn,
    refreshAllLabels,
  } = buildPanel(store);

  const fullRefresh = () => {
    refreshAllLabels();
    if (!panelOpen) {
      fab.setAttribute('aria-label', t('display.openButton'));
    } else {
      fab.setAttribute('aria-label', t('actions.close'));
    }
    panel.setAttribute('aria-label', t('display.title'));
    resetBtn.textContent = t('display.reset');
    fontSeg.setValue(store.prefs.fontScale);
    lineSeg.setValue(store.prefs.lineSpacing);
    togglesVision.forEach(([key], i) => {
      visionInputs[i].input.checked = Boolean(store.prefs[key]);
    });
    motionInputs.forEach(({ input }, i) => {
      input.checked = Boolean(store.prefs[motionKeys[i]]);
    });
    cbSelect.value = store.prefs.colorBlindness;
    localeSeg.setValue(store.locale);
    pauseBtn.textContent = store.tts.state === 'paused' ? t('display.tts.resume') : t('display.tts.pause');
    readBtn.textContent = t('display.tts.readSelection');
    stopBtn.textContent = t('display.tts.stop');
    fab.classList.toggle('incitta-a11y-fab--active', store.isAnyEnabled);
  };

  const setOpen = (open) => {
    panelOpen = open;
    fab.setAttribute('aria-expanded', open ? 'true' : 'false');
    fab.setAttribute('aria-label', open ? t('actions.close') : t('display.openButton'));
    drawer.classList.toggle('incitta-a11y-drawer--open', open);
    panel.setAttribute('aria-hidden', open ? 'false' : 'true');
    backdrop.classList.toggle('incitta-a11y-backdrop--visible', open);

    if (open) {
      previouslyFocused = /** @type {HTMLElement} */ (document.activeElement);
      backdrop.removeAttribute('hidden');
      document.body.classList.add('incitta-a11y-panel-open');

      const hamburger = document.querySelector('.hamburger');
      const navMenu = document.querySelector('.nav-menu');
      if (navMenu?.classList.contains('active')) {
        hamburger?.classList.remove('active');
        navMenu.classList.remove('active');
        hamburger?.setAttribute('aria-expanded', 'false');
      }

      resetBtn.focus();
    } else {
      backdrop.setAttribute('hidden', '');
      document.body.classList.remove('incitta-a11y-panel-open');

      const navMenu = document.querySelector('.nav-menu');
      if (!navMenu?.classList.contains('active')) {
        document.body.style.overflow = 'auto';
      }

      fab.focus();
      previouslyFocused = null;
    }
  };

  fab.addEventListener('click', () => setOpen(!panelOpen));
  backdrop.addEventListener('click', () => setOpen(false));

  document.addEventListener('keydown', onKeydown);
  function onKeydown(e) {
    if (e.key !== 'Escape' || !panelOpen) return;
    e.stopPropagation();
    setOpen(false);
  }

  drawer.append(fab, panel);
  root.append(backdrop, drawer);
  document.body.appendChild(root);
  panel.setAttribute('aria-hidden', 'true');

  const unsubStore = store.subscribe(fullRefresh);
  const unsubTts = store.tts.subscribe(fullRefresh);
  fullRefresh();

  return {
    destroy() {
      document.removeEventListener('keydown', onKeydown);
      unsubStore();
      unsubTts();
      setOpen(false);
      root.remove();
    },
  };
}

export function isA11yPanelOpen() {
  return panelOpen;
}

export function getA11yRoot() {
  return document.getElementById(ROOT_ID);
}
