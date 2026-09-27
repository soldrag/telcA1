/**
 * A1 Lexicon Service: Fast dictionary lookup & contextual POS disambiguation.
 * Adheres strictly to McConnell limits (<= 150 lines, <= 25 lines per function).
 */

import rawLexicon from './a1Lexicon.json' with { type: 'json' };
import { lookupDictionaryNoun, loadGermanNounDictionary } from './germanNounDictionary.js';
import { lookupDictionaryVerb, loadGermanVerbDictionary, findDictionaryVerbForms } from './germanVerbDictionary.js';

const LEXICON = rawLexicon || {};

// A word the A1 vocabulary does not know gets general-dictionary readings. German writes nouns with a capital,
// so a capitalised word is looked up as a noun first: an unknown verb ("laufen") is not read as "das Laufen".
// A capitalised word that is no noun may be a verb opening the sentence ("Spreche ich …"); a known word keeps its
// A1 readings ("Ich", "Liebe").
function dictionaryEntries(bare) {
  const nouns = /^[A-ZÄÖÜ]/.test(bare) ? lookupDictionaryNoun(bare) : [];
  return nouns.length > 0 ? nouns : lookupDictionaryVerb(bare);
}

/** A1 entries first, then general dictionary nouns and verbs; the dictionaries must be loaded (loadLexiconData). */
export function lookupWord(word = '') {
  if (!word) return [];
  const bare = String(word).replace(/^[.,!?;:]+|[.,!?;:]+$/g, '').trim();
  const levelEntries = LEXICON[bare.toLowerCase()] || [];
  return levelEntries.length > 0 ? levelEntries : dictionaryEntries(bare);
}

/** Loads the general dictionary data the lookups rely on; resolves immediately once loaded. */
export async function loadLexiconData() {
  await Promise.all([loadGermanNounDictionary(), loadGermanVerbDictionary()]);
}

/**
 * @returns {string[]} A1 vocabulary forms with at least one entry matching the predicate; when the A1 vocabulary has
 *   none, the dictionary verb forms ("spricht" for "sprechen"). Dictionary nouns are never generated.
 */
export function findWordForms(predicate) {
  const levelForms = Object.keys(LEXICON).filter((word) => LEXICON[word].some(predicate));
  return levelForms.length > 0 ? levelForms : findDictionaryVerbForms(predicate);
}

export function isKnownWord(word = '') {
  return lookupWord(word).length > 0;
}

// German capitalises nouns: a capitalised word the lexicon knows only as a verb, standing after a
// preposition, article or adjective, is a nominalisation or a homonymous noun ("nach Kosten", "das Essen").
// A capital alone is not enough: A1 learners capitalise verbs ("ich Komme").
const NOMINAL_CONTEXT = new Set(['PREP', 'DET', 'ADJ']);

function isNominalisedVerb(raw, candidates, prevPosList = []) {
  if (!/^[A-ZÄÖÜ]/.test(raw) || !prevPosList.some((pos) => NOMINAL_CONTEXT.has(pos))) return false;
  return candidates.length > 0 && candidates.every((c) => String(c.pos || '').startsWith('VERB'));
}

// Looking ahead, the current word is not tagged yet: only a word that can be a preposition or an article
// makes the next capitalised verb form a noun. An adjective reading is too weak ("gut" is mostly an adverb).
function governingPositions(word) {
  return lookupWord(word).map((c) => c.pos).filter((pos) => pos === 'PREP' || pos === 'DET');
}

function resolveVerbHomonymy(candidates = [], prevToken = null, nextToken = null, hasFiniteVerb = false) {
  const hasInf = candidates.some(c => c.pos === 'VERB_INF');
  const hasFin = candidates.some(c => c.pos === 'VERB_FIN' || c.pos === 'VERB_MOD');
  if (!hasInf || !hasFin) return null;

  if (hasFiniteVerb) {
    return candidates.find(c => c.pos === 'VERB_INF') || null;
  }

  if (prevToken && (prevToken.pos === 'PRON_SUBJ' || prevToken.pos === 'NOUN')) {
    return candidates.find(c => c.pos === 'VERB_FIN' || c.pos === 'VERB_MOD') || null;
  }
  // Inverted questions, imperatives, or V2 after fronted adverbs/particles: "Können wir...", "Bitte rufen Sie...", "Leider kann ich..."
  const prevLower = (prevToken?.raw || prevToken?.lemma || '').toLowerCase().replace(/^[.,!?;:]+|[.,!?;:]+$/g, '');
  const isPoliteIntro = prevToken && ['bitte', 'leider', 'vielleicht', 'jetzt', 'dann', 'zuerst', 'heute', 'morgen'].includes(prevLower);
  const isFrontedAdverbOrPart = prevToken && (prevToken.pos === 'ADV' || prevToken.pos === 'PART' || prevToken.pos === 'INTERROG' || isPoliteIntro);

  const subjectFollows = nextToken && ['PRON_SUBJ', 'DET', 'NOUN'].includes(nextToken.pos);
  if (!prevToken || (isFrontedAdverbOrPart && subjectFollows)) {
    return candidates.find(c => c.pos === 'VERB_FIN' || c.pos === 'VERB_MOD') || null;
  }
  return candidates.find(c => c.pos === 'VERB_INF') || null;
}

function resolveSpecialParticles(lower = '', prevToken = null, nextToken = null) {
  if (lower === 'bitte') {
    if (prevToken && prevToken.raw?.toLowerCase() === 'ich') {
      return { pos: 'VERB_FIN', lemma: 'bitten', person: [1], number: 'sg', valency: 'TRANS' };
    }
    return { pos: 'ADV', lemma: 'bitte' };
  }
  if (lower === 'nach') {
    if (nextToken && (nextToken.pos === 'NOUN' || nextToken.pos === 'DET')) {
      return { pos: 'PREP', lemma: 'nach', prepCase: 'DAT' };
    }
    return { pos: 'VERB_PREFIX', lemma: 'nach' };
  }
  return null;
}

export function disambiguateToken(rawWord = '', prevToken = null, nextToken = null, hasFiniteVerb = false) {
  const raw = String(rawWord || '').trim();
  const lower = raw.toLowerCase().replace(/^[.,!?;:]+|[.,!?;:]+$/g, '');
  const candidates = lookupWord(raw);

  const fallback = {
    raw,
    lower,
    pos: /^[A-ZÄÖÜ]/.test(raw) ? 'NOUN' : 'UNKNOWN',
    lemma: raw
  };

  if (candidates.length === 0) return fallback;
  if (isNominalisedVerb(raw, candidates, [prevToken?.pos])) return { raw, lower, pos: 'NOUN', lemma: lower };
  if (candidates.length === 1) return { raw, lower, ...candidates[0] };

  const special = resolveSpecialParticles(lower, prevToken, nextToken);
  if (special) return { raw, lower, ...special };

  const verbChoice = resolveVerbHomonymy(candidates, prevToken, nextToken, hasFiniteVerb);
  if (verbChoice) return { raw, lower, ...verbChoice };

  return { raw, lower, ...candidates[0] };
}

export function tagTokens(words = []) {
  const result = [];
  let hasFiniteVerb = false;
  for (let i = 0; i < words.length; i++) {
    const prev = result[i - 1] || null;
    const nextRaw = words[i + 1] || '';
    const nextCandidates = lookupWord(nextRaw);
    const nextIsNoun = isNominalisedVerb(nextRaw, nextCandidates, governingPositions(words[i]));
    const next = nextCandidates.length > 0 ? { raw: nextRaw, ...nextCandidates[0], ...(nextIsNoun && { pos: 'NOUN' }) } : null;
    const tagged = disambiguateToken(words[i], prev, next, hasFiniteVerb);
    if (tagged.pos === 'VERB_FIN' || tagged.pos === 'VERB_MOD') {
      hasFiniteVerb = true;
    }
    result.push(tagged);
  }
  return result;
}
