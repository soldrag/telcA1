/**
 * Rubric keyword ↔ text word matching by stem, guarded by word class.
 * The stemmer folds "Anmeldung"/"anmelden" together on purpose, but also "Wohnung"/"wohne" and
 * "Zeitung"/"Zeit": a stem match between a word the lexicon knows only as a noun and one it knows
 * only as a verb is a different concept. Rubrics that mean both list both forms.
 * Unknown words (typos, words outside the lexicon) keep the plain stem match and may also match by
 * spelling: one edit away ("krangk", "kuhen") or by sound ("vonung" ~ "Wohnung"). Orthography is not
 * graded, so a misspelt keyword still states the point. A known word is never re-read as another one.
 */

import { stemGermanWord } from './germanStemmer.js';
import { germanPhoneticKey } from './germanPhoneticKey.js';
import { calculateLevenshtein } from '../schreibenFuzzyMatcher.js';

const MIN_EDIT_LENGTH = 4;
const MIN_PHONETIC_LENGTH = 5;
const MIN_PHONETIC_KEY = 3;

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

function isMisspelling(keywordWord, word, lexicon) {
  if ((lexicon.lookup(word) || []).length > 0) return false;
  const shorter = Math.min(keywordWord.length, word.length);
  if (shorter >= MIN_EDIT_LENGTH && calculateLevenshtein(keywordWord, word) <= 1) return true;
  if (shorter < MIN_PHONETIC_LENGTH) return false;
  const key = germanPhoneticKey(word);
  return key.length >= MIN_PHONETIC_KEY && key === germanPhoneticKey(keywordWord);
}

function matchesToken(keywordWord, token, lexicon) {
  if (token.stem === stemGermanWord(keywordWord)) return areWordClassesCompatible(keywordWord, token.w, lexicon);
  return isMisspelling(keywordWord, token.w, lexicon);
}

// A phrase keyword ("nächste woche") needs its words in a row, each matched like a single keyword.
function matchesPhraseAt(parts, tokens, start, lexicon) {
  return parts.every((part, offset) => tokens[start + offset] && matchesToken(part, tokens[start + offset], lexicon));
}

/**
 * Keywords (lower-case rubric words or phrases) found in the given words by stem and compatible word class.
 * @returns {string[]} the matched keywords
 */
export function findMatchedKeywords(keywords = [], words = [], lexicon) {
  const tokens = words.map(cleanWord).filter(Boolean).map((w) => ({ w, stem: stemGermanWord(w) }));
  return keywords.filter((keyword) => {
    const parts = cleanWord(keyword).split(/\s+/).filter(Boolean);
    return parts.length > 0 && tokens.some((_, start) => matchesPhraseAt(parts, tokens, start, lexicon));
  });
}
