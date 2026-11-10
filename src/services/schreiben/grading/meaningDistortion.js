/**
 * Meaning distortions of a Leitpunkt (rubric data: `semantic_slots`, `conversive_rules`) in the span the assessor
 * read it from: "Wie viel kostet mein Sohn?" for the price, "vermieten" for "mieten". A fact per Leitpunkt; what it
 * costs is the regulation's call (distorted but understandable).
 */

import { validateSentenceFrame } from '../linguistic/semanticFrameValidator.js';
import { splitGermanSentences } from '../linguistic/sentenceTokenizer.js';

const hasFrameRules = (criterion = {}) => Boolean(criterion.semantic_slots?.length || criterion.conversive_rules?.length);

function readSentence(sentence, criterion, lexicon) {
  const words = sentence.trim().replace(/[.,!?;:]+$/, '').split(/\s+/).filter(Boolean);
  return validateSentenceFrame({
    taggedTokens: lexicon.tag(words),
    conversiveRules: criterion.conversive_rules || [],
    semanticSlots: criterion.semantic_slots || [],
  }).errors;
}

/**
 * @param {{ spans: string[], criteria: object[], lexicon: object }} input - spans: the span each Leitpunkt was read
 *   from ('' when none), in rubric order
 * @returns {Array<object[]>} the distortion errors per Leitpunkt (empty when none)
 */
export function findMeaningDistortions({ spans, criteria, lexicon }) {
  return criteria.map((criterion, i) => (spans[i] && hasFrameRules(criterion)
    ? splitGermanSentences(spans[i]).flatMap((s) => readSentence(s, criterion, lexicon))
    : []));
}
