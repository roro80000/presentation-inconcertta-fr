/** @typedef {'female' | 'male' | 'neutral'} VoiceProfile */

export const VOICE_PROFILES = /** @type {const} */ (['female', 'male', 'neutral']);

export const DEFAULT_VOICE_PROFILE = 'female';

const FEMALE_HINTS = [
  /amélie|amelie|audrey|virginie|marie|denise|hortense|elo[iï]se|gabrielle|sylvie|céline|celine/i,
  /femme|female|woman|féminin|feminin/i,
];

const MALE_HINTS = [
  /thomas|nicolas|henri|paul|claude|jacques|antoine|yves|daniel|damien|guillaume/i,
  /homme|male|\bman\b|masculin/i,
];

const NEUTRAL_HINTS = [
  /neutre|neutral|google français|google francais|microsoft.*fran/i,
];

/**
 * @param {SpeechSynthesisVoice} voice
 */
function voiceHaystack(voice) {
  return `${voice.name} ${voice.voiceURI}`.toLowerCase();
}

/**
 * @param {SpeechSynthesisVoice} voice
 * @returns {VoiceProfile | null}
 */
export function detectVoiceProfile(voice) {
  if (!voice) return null;
  const hay = voiceHaystack(voice);

  if (FEMALE_HINTS.some((re) => re.test(hay))) return 'female';
  if (MALE_HINTS.some((re) => re.test(hay))) return 'male';
  if (NEUTRAL_HINTS.some((re) => re.test(hay))) return 'neutral';
  return null;
}

/**
 * @param {SpeechSynthesisVoice} voice
 * @param {VoiceProfile} profile
 */
function scoreVoiceForProfile(voice, profile) {
  const hay = voiceHaystack(voice);
  const hints =
    profile === 'female' ? FEMALE_HINTS
    : profile === 'male' ? MALE_HINTS
    : NEUTRAL_HINTS;

  let score = 0;
  for (const re of hints) {
    if (re.test(hay)) score += 10;
  }

  if (voice.lang === 'fr-FR') score += 3;
  else if (voice.lang.startsWith('fr')) score += 2;
  if (voice.localService) score += 1;

  return score;
}

/**
 * @param {SpeechSynthesisVoice[]} voices
 */
export function filterFrenchVoices(voices) {
  const fr = voices.filter((v) => v.lang?.toLowerCase().startsWith('fr'));
  return fr.length > 0 ? fr : voices;
}

/**
 * @param {SpeechSynthesisVoice[]} voices
 * @param {VoiceProfile} profile
 * @returns {SpeechSynthesisVoice | null}
 */
export function resolveVoiceForProfile(voices, profile) {
  const pool = filterFrenchVoices(voices);
  if (!pool.length) return null;

  const ranked = pool
    .map((voice) => ({ voice, score: scoreVoiceForProfile(voice, profile) }))
    .sort((a, b) => b.score - a.score);

  if (ranked[0].score > 0) return ranked[0].voice;

  if (profile === 'neutral') {
    const ambiguous = pool.find((v) => !detectVoiceProfile(v));
    if (ambiguous) return ambiguous;
    return pool[Math.min(1, pool.length - 1)] ?? pool[0];
  }

  if (profile === 'female') {
    return pool.find((v) => detectVoiceProfile(v) === 'female') ?? pool[0];
  }

  return pool.find((v) => detectVoiceProfile(v) === 'male') ?? pool[0];
}

/**
 * @param {unknown} value
 * @returns {VoiceProfile}
 */
export function normalizeVoiceProfile(value) {
  if (value === 'female' || value === 'male' || value === 'neutral') return value;
  return DEFAULT_VOICE_PROFILE;
}
