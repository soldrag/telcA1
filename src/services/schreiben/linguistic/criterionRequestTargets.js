/**
 * Refusable targets of a Leitpunkt, derived from its rubric contract.
 * Lexical knowledge lives in rubric data (keywords); this module only normalizes it,
 * so a negation counts as a refusal only when it hits what the Leitpunkt is about.
 */

import { stemByLemma } from './lemmaStem.js';

const MIN_STEM_LENGTH = 3;

/**
 * @typedef {Object} RequestTargets
 * @property {(word: string) => boolean} has - the word is a form of a rubric keyword
 */

/**
 * @param {object} criterion - rubric Leitpunkt (keywords)
 * @param {{ lookup: Function }} lexicon - the level's lexicon port
 * @returns {RequestTargets}
 */
export function buildRequestTargets(criterion = {}, lexicon) {
  const words = (criterion.keywords || []).flatMap((k) => String(k).split(/\s+/));
  const stems = new Set(words.map((w) => stemByLemma(w, lexicon)).filter((s) => s.length >= MIN_STEM_LENGTH));
  return { has: (word) => stems.has(stemByLemma(word, lexicon)) };
}

export function isTargetNoun(noun = '', targets = new Set()) {
  return targets.has(noun);
}

// A separable verb ("kommen Sie … vorbei") is anchored by its base verb as well as its full lemma.
export function isTargetAction(predicateCore = {}, targets = new Set()) {
  const { baseAction, finVerb, nonFinVerb } = predicateCore;
  return [baseAction, nonFinVerb?.baseVerb, finVerb?.baseVerb]
    .filter(Boolean)
    .some((verb) => targets.has(verb));
}
