/**
 * Aspect concept evidence: does a sentence state an aspect of a criterion through the level's concept
 * domains or a structured detector, even when it uses none of the rubric's keywords?
 * ("Ist die Wohnung billig?" states "Preis" although the rubric lists only kosten/preis.)
 * Shared by sentence retrieval (Stage 2) and sentence-to-Leitpunkt segmentation, so both read the same
 * level data the scorers already trust. Engine code: the domains and threshold come from the injected policy.
 */

import { stemByLemma } from '../linguistic/lemmaStem.js';
import { resolveAspectEvidence } from '../linguistic/criterionIntents.js';
import { isCompoundCriterion, splitCompoundCriterion } from './compoundCriterionDecomposer.js';
import { scoreAspectConceptOverlap } from './conceptDomainScorer.js';
import { requireLevelPort } from './levelPorts.js';

function criterionAspects(criterion) {
  const label = criterion.label || criterion.id || '';
  return isCompoundCriterion(label) ? splitCompoundCriterion(label) : [label];
}

/**
 * @param {object} criterion - rubric Leitpunkt (label, aspects, evidence)
 * @param {string} sentence - already reduced to its affirmed clauses by the caller when polarity matters
 * @param {{ policy: object }} context - the level policy: concept domains and the partial threshold
 */
export function hasAspectConceptEvidence(criterion = {}, sentence = '', { policy } = {}) {
  requireLevelPort(policy, 'hasAspectConceptEvidence: policy');
  const rawSentence = String(sentence || '').toLowerCase();
  if (!rawSentence.trim()) return false;
  const sentenceStems = rawSentence.replace(/[.,!?;:]+/g, ' ').split(/\s+/).filter(Boolean).map((w) => stemByLemma(w, policy.lexicon));
  return criterionAspects(criterion).some((aspect) => {
    const evidence = resolveAspectEvidence(criterion, aspect);
    const score = scoreAspectConceptOverlap({ label: aspect.toLowerCase(), evidence },
      { sentenceStems, rawSentence, domains: policy.conceptDomains, lexicon: policy.lexicon });
    return score >= policy.thresholds.partial;
  });
}
