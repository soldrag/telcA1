/**
 * Rubric keyword ↔ text word matching by stem of the lemma, guarded by word class.
 * The stemmer folds "Anmeldung"/"anmelden" together on purpose, but may fold a noun with an unrelated
 * verb: a stem match between a word the lexicon knows only as a noun and one it knows only as a verb
 * is a different concept. Rubrics that mean both list both forms.
 * Unknown words (typos, words outside the lexicon) keep the plain stem match.
 */

import { stemByLemma } from './lemmaStem.js';

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

function matchesToken(keywordWord, token, lexicon) {
  return token.stem === stemByLemma(keywordWord, lexicon) && areWordClassesCompatible(keywordWord, token.w, lexicon);
}

// A phrase keyword ("nächste woche") needs its words in a row, each matched like a single keyword.
function matchesPhraseAt(parts, tokens, start, lexicon) {
  return parts.every((part, offset) => tokens[start + offset] && matchesToken(part, tokens[start + offset], lexicon));
}

// A separable verb keyword ("anmelden": SEP, baseVerb "melden") splits in a main clause: the base verb
// is finite and the prefix closes the clause (Satzklammer) — "Wie melde ich mich an?".
function separableVerbParts(keyword, lexicon) {
  const entry = (lexicon.lookup(keyword) || []).find((e) => e.valency === 'SEP' && e.baseVerb);
  if (!entry || !keyword.endsWith(entry.baseVerb)) return null;
  return { prefix: keyword.slice(0, keyword.length - entry.baseVerb.length), baseStem: stemByLemma(entry.baseVerb, lexicon) };
}

function isClauseFinal(tokens, index) {
  return index === tokens.length - 1 || tokens[index].closesClause;
}

function matchesSeparatedVerb({ prefix, baseStem }, tokens) {
  return tokens.some((token, verbAt) => token.stem === baseStem && tokens.slice(verbAt + 1).some((later, offset) => {
    const at = verbAt + 1 + offset;
    return later.w === prefix && isClauseFinal(tokens, at) && !tokens.slice(verbAt, at).some((t) => t.closesClause);
  }));
}

function toTokens(words, lexicon) {
  return words.map((raw) => ({ w: cleanWord(raw), closesClause: /[.,!?;:]$/.test(String(raw)) }))
    .filter((t) => t.w)
    .map((t) => ({ ...t, stem: stemByLemma(t.w, lexicon) }));
}

function matchesKeyword(keyword, tokens, lexicon) {
  const parts = cleanWord(keyword).split(/\s+/).filter(Boolean);
  if (parts.length === 0) return false;
  if (tokens.some((_, start) => matchesPhraseAt(parts, tokens, start, lexicon))) return true;
  const separable = parts.length === 1 ? separableVerbParts(parts[0], lexicon) : null;
  return Boolean(separable) && matchesSeparatedVerb(separable, tokens);
}

/**
 * Keywords (lower-case rubric words or phrases) found in the given words by stem and compatible word class.
 * Words keep their punctuation: it marks clause ends for separated verb prefixes.
 * @returns {string[]} the matched keywords
 */
export function findMatchedKeywords(keywords = [], words = [], lexicon) {
  const tokens = toTokens(words, lexicon);
  return keywords.filter((keyword) => matchesKeyword(keyword, tokens, lexicon));
}
