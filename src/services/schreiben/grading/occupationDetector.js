/**
 * Occupation detector (token-based).
 * "Beruf" in a Leitpunkt means what the writer does for a living: an occupation noun ("ich bin Ärztin",
 * "Zwei Personen, Ingenieur"), a work verb with its role or workplace ("ich arbeite als Koch / bei Siemens /
 * im Krankenhaus"), "von Beruf" or studying. A bare "wir arbeiten (beide / hier)" says that one works,
 * not what one does, so it is not evidence here.
 */

import roleWords from '../linguistic/data/roleWords.json' with { type: 'json' };

const WORK_VERBS = new Set(roleWords.workVerbForms);
// Role ("als Koch") or employer/workplace ("bei Siemens", "beim Bäcker", "im Krankenhaus"). "in"/"für" are
// left out: "in Berlin", "für die Natur" name a place or a cause, not an occupation.
const ROLE_MARKERS = new Set(['als', 'bei', 'beim', 'im']);
const STUDY_WORDS = new Set(roleWords.studyWords);
const MARKER_WINDOW = 2;

const OCCUPATION_HEADS = roleWords.occupationHeads;
const MIN_COMPOUND_PREFIX = 2;

function tokenize(text = '') {
  return String(text).toLowerCase().split(/[\s,.;:!?()]+/).filter(Boolean);
}

function stripFeminine(token) {
  if (token.endsWith('innen')) return token.slice(0, -5);
  if (token.endsWith('in') && token.length > 5) return token.slice(0, -2);
  return token;
}

// "-(e)n" plurals ("Studenten", "Lehrerinnen") reduce to the singular; "-e" plurals are listed, since
// stripping "-e" would turn verbs into nouns ("ich koche" → "Koch").
function nounBases(token) {
  const base = stripFeminine(token);
  return [base, base.replace(/en$/, ''), base.replace(/n$/, '')];
}

function isHead(base, head) {
  return base === head || (head.length >= 4 && base.endsWith(head) && base.length - head.length >= MIN_COMPOUND_PREFIX);
}

function isOccupationNoun(token) {
  return nounBases(token).some((base) => OCCUPATION_HEADS.some((head) => isHead(base, head)));
}

function hasRoleAfterWorkVerb(tokens) {
  return tokens.some((token, i) => WORK_VERBS.has(token)
    && tokens.slice(i + 1, i + 1 + MARKER_WINDOW).some((t) => ROLE_MARKERS.has(t)));
}

function hasVonBeruf(tokens) {
  return tokens.some((token, i) => token === 'von' && tokens[i + 1] === 'beruf');
}

/**
 * @param {string} text
 * @returns {boolean}
 */
export function hasOccupation(text = '') {
  const tokens = tokenize(text);
  return tokens.some(isOccupationNoun)
    || tokens.some((t) => STUDY_WORDS.has(t))
    || hasRoleAfterWorkVerb(tokens)
    || hasVonBeruf(tokens);
}
