/**
 * Polarity & frame gate for the sentences gathered as evidence for one Leitpunkt.
 * A refusal zeroes the Leitpunkt only when no affirmative sentence fulfils it:
 * vector matching can pull unrelated or partially negated sentences into the evidence.
 */

import { tagTokens } from '../linguistic/a1LexiconService.js';
import { validateSentenceFrame } from '../linguistic/semanticFrameValidator.js';
import { detectSemanticInversion } from '../linguistic/semanticPolarityValidator.js';

const REFUSAL_PENALTY = 2;
const NO_INVERSION = Object.freeze({ isInverted: false });

function findRefusal(sentences, criterion) {
  let refusal = NO_INVERSION;
  for (const s of sentences) {
    const pol = detectSemanticInversion(s, criterion);
    if (pol.isInverted) refusal = pol;
  }
  return refusal;
}

function validateEvidenceFrame(sentence, criterion) {
  const words = sentence.trim().replace(/[.,!?;:]+$/, '').split(/\s+/).filter(Boolean);
  return validateSentenceFrame({
    taggedTokens: tagTokens(words),
    conversiveRules: criterion.conversive_rules || [],
    semanticSlots: criterion.semantic_slots || []
  });
}

export function assessEvidenceSentences({ sentences = [], criterion = {}, hasAffirmativeEvidence = false }) {
  let penalty = 0;
  const frameErrors = [];
  for (const s of sentences) {
    const res = validateEvidenceFrame(s, criterion);
    if (!res.isValid) {
      penalty = Math.max(penalty, res.maxPenalty);
      frameErrors.push(...res.errors);
    }
  }
  const inversionInfo = hasAffirmativeEvidence ? NO_INVERSION : findRefusal(sentences, criterion);
  if (inversionInfo.isInverted) penalty = Math.max(penalty, REFUSAL_PENALTY);
  return { penalty, frameErrors, inversionInfo };
}
