/**
 * Rubric keyword ↔ text word matching by stem, guarded by word class.
 * The stemmer folds "Anmeldung"/"anmelden" together on purpose, but also "Wohnung"/"wohne" and
 * "Zeitung"/"Zeit": a stem match between a word the lexicon knows only as a noun and one it knows
 * only as a verb is a different concept. Rubrics that mean both list both forms.
 * Unknown words (typos, words outside the lexicon) keep the plain stem match.
 */

import { stemGermanWord } from './germanStemmer.js';

function wordClasses(word, lexicon) {
  const entries = lexicon.lookup(word) || [];
  return new Set(entries.map((e) => (String(e.pos || '').startsWith('VERB') ? 'VERB' : e.pos)));
}

function isNounOnly(classes) {
  return classes.size > 0 && [...classes].every((c) => c === 'NOUN');
}

function isVerbOnly(classes) {
  return classes.size > 0 && [...classes].every((c) => c === 'VERB');
}

/** @param {{ lookup: Function }} lexicon - the level's lexicon port */
export function areWordClassesCompatible(a, b, lexicon) {
  const ca = wordClasses(a, lexicon);
  const cb = wordClasses(b, lexicon);
  return !((isNounOnly(ca) && isVerbOnly(cb)) || (isVerbOnly(ca) && isNounOnly(cb)));
}

function cleanWord(word) {
  return String(word || '').toLowerCase().replace(/[.,!?;:()«»"„“]/g, '');
}

/**
 * Keywords (lower-case rubric words) found in the given words by stem and compatible word class.
 * @returns {string[]} the matched keywords
 */
export function findMatchedKeywords(keywords = [], words = [], lexicon) {
  const tokens = words.map(cleanWord).filter(Boolean).map((w) => ({ w, stem: stemGermanWord(w) }));
  return keywords.filter((keyword) => {
    const kw = cleanWord(keyword);
    const kwStem = stemGermanWord(kw);
    return tokens.some(({ w, stem }) => stem === kwStem && areWordClassesCompatible(kw, w, lexicon));
  });
}
