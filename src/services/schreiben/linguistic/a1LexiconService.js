/**
 * A1 Lexicon Service: Fast dictionary lookup & contextual POS disambiguation.
 * Adheres strictly to McConnell limits (<= 150 lines, <= 25 lines per function).
 */

import rawLexicon from './a1Lexicon.json' with { type: 'json' };
import { lookupDictionaryNoun, loadGermanNounDictionary } from './germanNounDictionary.js';
import { lookupDictionaryVerb, loadGermanVerbDictionary, findDictionaryVerbForms } from './germanVerbDictionary.js';

const LEXICON = rawLexicon || {};

// A word the A1 vocabulary does not know gets general-dictionary readings. German writes nouns with a capital,
// so only a capitalised word gets noun readings, and they come first: an unknown verb ("laufen") is not read as
// "das Laufen". A capitalised word keeps its verb readings after them, for a verb opening the sentence ("Lese ich …",
// "Lese" is also a noun); the tagger chooses by position. A known word keeps its A1 readings ("Ich", "Liebe").
function dictionaryEntries(bare) {
  const nouns = /^[A-ZÄÖÜ]/.test(bare) ? lookupDictionaryNoun(bare) : [];
  return [...nouns, ...lookupDictionaryVerb(bare)];
}

// The A1 list gives a verb's present singular and plural forms; the dictionary adds the readings it leaves out for
// the same verb ("kommt" is also "ihr kommt", "kam" the past of "kommen").
// A lower-case A1 adjective or adverb may still be a verb form ("liebe": "Liebe Anna", "ich liebe dich"); the
// tagger chooses by position. Nouns, articles and pronouns keep their A1 readings ("tage", "einen", "meinen").
function withDictionaryVerbReadings(bare, levelEntries) {
  const levelVerbs = levelEntries.filter((e) => String(e.pos).startsWith('VERB') && e.person);
  if (levelVerbs.length === 0) {
    const homographs = /^[a-zäöüß]/.test(bare) && levelEntries.every((e) => e.pos === 'ADJ' || e.pos === 'ADV')
      ? lookupDictionaryVerb(bare).filter((d) => d.pos === 'VERB_FIN') : [];
    return homographs.length ? [...levelEntries, ...homographs] : levelEntries;
  }
  const known = (d) => levelVerbs.some((e) => e.lemma === d.lemma && e.number === d.number && !d.tense
    && d.person.every((p) => e.person.includes(p)));
  const extra = lookupDictionaryVerb(bare).filter((d) => d.person && levelVerbs.some((e) => e.lemma === d.lemma) && !known(d));
  return extra.length ? [...levelEntries, ...extra] : levelEntries;
}

/** A1 entries first, then general dictionary nouns and verbs; the dictionaries must be loaded (loadLexiconData). */
export function lookupWord(word = '') {
  if (!word) return [];
  const bare = String(word).replace(/^[.,!?;:]+|[.,!?;:]+$/g, '').trim();
  const levelEntries = LEXICON[bare.toLowerCase()] || [];
  return levelEntries.length > 0 ? withDictionaryVerbReadings(bare, levelEntries) : dictionaryEntries(bare);
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
  // A capitalised dictionary word opening the sentence is the verb of a question or an imperative when it has a
  // finite reading ("Lese ich …", "Spielt Anna Tennis?", "Beginnt der Kurs …?"), unless a finite verb or a
  // preposition follows: then it is a nominalised subject ("Lesen ist mein Hobby", "Schwimmen im See …").
  // Elsewhere the capital marks a noun: a dictionary noun reading, or the nominalised verb.
  const isCapitalised = /^[A-ZÄÖÜ]/.test(raw);
  const nominalFollows = ['VERB_FIN', 'VERB_MOD', 'PREP'].includes(nextToken?.pos);
  const openingVerb = isCapitalised && !prevToken && !nominalFollows
    && candidates.find((c) => c.source === 'dictionary' && (c.pos === 'VERB_FIN' || c.pos === 'VERB_MOD'));
  if (openingVerb) return { raw, lower, ...openingVerb };
  if (isCapitalised && candidates.every((c) => c.source === 'dictionary')) {
    const noun = candidates.find((c) => c.pos === 'NOUN');
    return noun ? { raw, lower, ...noun } : { raw, lower, pos: 'NOUN', lemma: raw };
  }
  if (candidates.length === 1) return { raw, lower, ...candidates[0] };

  // Right after a subject pronoun stands the finite verb when a reading agrees with it: "ich liebe dich".
  const agreeingVerb = prevToken?.pos === 'PRON_SUBJ' && candidates.find((c) => c.pos === 'VERB_FIN'
    && c.person?.some((p) => prevToken.person?.includes(p)) && (!c.number || !prevToken.number || c.number === prevToken.number));
  if (agreeingVerb && !candidates[0].pos.startsWith('VERB')) return { raw, lower, ...agreeingVerb };

  // A pronoun/possessive homograph before a noun or adjective is the possessive when its form fits the noun:
  // "Hat Ihr Sohn …?", "ihr Kind" — but "Ich gebe ihr Blumen" (plural needs "ihre") keeps the pronoun.
  const determiner = ['NOUN', 'ADJ'].includes(nextToken?.pos) && candidates.find((c) => c.pos === 'DET'
    && (nextToken.pos === 'ADJ' || (nextToken.number !== 'pl' && (!c.gender || !nextToken.gender || c.gender === nextToken.gender || nextToken.gender === 'n'))));
  if (determiner) return { raw, lower, ...determiner };

  // A participle/finite homograph before an auxiliary is the participle: "…, von der ich dir erzählt habe".
  const participle = String(nextToken?.pos).startsWith('VERB') && ['haben', 'sein', 'werden'].includes(nextToken?.lemma)
    && candidates.find((c) => c.pos === 'VERB_PART');
  if (participle) return { raw, lower, ...participle };

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
