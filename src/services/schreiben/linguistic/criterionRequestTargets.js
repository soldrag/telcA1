/**
 * Refusable targets of a Leitpunkt, derived from its rubric contract.
 * Lexical knowledge lives in rubric data (keywords); this module only normalizes it,
 * so a negation counts as a refusal only when it hits what the Leitpunkt is about.
 */

import { stemGermanWord } from './germanStemmer.js';

const MIN_STEM_LENGTH = 3;

export function buildRequestTargets(criterion = {}) {
  const words = (criterion.keywords || []).flatMap((k) => String(k).split(/\s+/));
  return new Set(words.map(stemGermanWord).filter((s) => s.length >= MIN_STEM_LENGTH));
}

export function isTargetNoun(noun = '', targets = new Set()) {
  return targets.has(stemGermanWord(noun));
}

// A separable verb ("kommen Sie … vorbei") is anchored by its base verb as well as its full lemma.
export function isTargetAction(predicateCore = {}, targets = new Set()) {
  const { baseAction, finVerb, nonFinVerb } = predicateCore;
  return [baseAction, nonFinVerb?.baseVerb, finVerb?.baseVerb]
    .filter(Boolean)
    .some((verb) => targets.has(stemGermanWord(verb)));
}
