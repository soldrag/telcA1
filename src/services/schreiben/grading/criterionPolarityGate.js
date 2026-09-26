/**
 * Polarity & frame gate for the sentences gathered as evidence for one Leitpunkt.
 * A refusal zeroes the Leitpunkt only when no affirmative sentence fulfils it:
 * vector matching can pull unrelated or partially negated sentences into the evidence.
 */

import { validateSentenceFrame } from '../linguistic/semanticFrameValidator.js';
import { detectSemanticInversion } from '../linguistic/semanticPolarityValidator.js';
import { defaultA1RankerPolicy } from './policies/a1RankerPolicy.js';

const REFUSAL_PENALTY = 2;
const NO_INVERSION = Object.freeze({ isInverted: false });

function findRefusal(sentences, criterion, lexicon) {
  let refusal = NO_INVERSION;
  for (const s of sentences) {
    const pol = detectSemanticInversion(s, criterion, { lexicon });
    if (pol.isInverted) refusal = pol;
  }
  return refusal;
}

function validateEvidenceFrame(sentence, criterion, lexicon) {
  const words = sentence.trim().replace(/[.,!?;:]+$/, '').split(/\s+/).filter(Boolean);
  return validateSentenceFrame({
    taggedTokens: lexicon.tag(words),
    conversiveRules: criterion.conversive_rules || [],
    semanticSlots: criterion.semantic_slots || []
  });
}

/** lexicon: the level's lexicon port (ranker policy `lexicon`). */
export function assessEvidenceSentences({ sentences = [], criterion = {}, hasAffirmativeEvidence = false, lexicon = defaultA1RankerPolicy.lexicon }) {
  let penalty = 0;
  const frameErrors = [];
  for (const s of sentences) {
    const res = validateEvidenceFrame(s, criterion, lexicon);
    if (!res.isValid) {
      penalty = Math.max(penalty, res.maxPenalty);
      frameErrors.push(...res.errors);
    }
  }
  const inversionInfo = hasAffirmativeEvidence ? NO_INVERSION : findRefusal(sentences, criterion, lexicon);
  if (inversionInfo.isInverted) penalty = Math.max(penalty, REFUSAL_PENALTY);
  return { penalty, frameErrors, inversionInfo };
}
