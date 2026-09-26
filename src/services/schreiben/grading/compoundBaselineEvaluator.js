/**
 * Synchronous Baseline Evaluator for Compound Criteria.
 * Evaluates multi-faceted Leitpunkte (e.g. "Personen und Zeitraum") in Stage 0-2 baseline
 * by checking each atomic sub-aspect against the concept domains and rubric keywords.
 * Zero model dependency; strictly conforms to McConnell limits (<= 70 lines).
 */

import {
  isCompoundCriterion,
  splitCompoundCriterion,
  aggregateCompoundResults,
} from './compoundCriterionDecomposer.js';
import {
  partitionAspectKeywordsSync,
  computeDeterministicFallbackScore,
} from './rankerFallbackScorer.js';
import { resolveAspectEvidence } from '../linguistic/criterionIntents.js';
import { requireLevelPort } from './levelPorts.js';

/**
 * A criterion whose rubric declares a detector-provable evidence kind (`criterion.evidence`) is only
 * supported when the detector or the rubric's own keywords/concepts find it in the text: similarity to
 * the criterion query alone ("mein Sohn ist krank" next to "Wie lange Sie fehlen") does not state it.
 * @returns {boolean|null} null when the criterion is compound or declares no evidence kind
 */
export function hasDeclaredEvidenceSupport(criterion = {}, evalText = '', { policy } = {}) {
  requireLevelPort(policy, 'hasDeclaredEvidenceSupport: policy');
  const label = criterion.label || criterion.id || '';
  if (!criterion.evidence || isCompoundCriterion(label)) return null;
  const aspect = { label, keywords: criterion.keywords || [], evidence: criterion.evidence };
  return policy.classifyScore(computeDeterministicFallbackScore(aspect, evalText, { policy })) !== 'no';
}

/** policy: the level's ranker policy (coverage thresholds and compound aggregation). */
export function evaluateCompoundCriterionBaseline(criterion = {}, evalText = '', { policy } = {}) {
  requireLevelPort(policy, 'evaluateCompoundCriterionBaseline: policy');
  const label = criterion.label || criterion.id || '';
  if (!isCompoundCriterion(label)) return null;

  const aspectLabels = splitCompoundCriterion(label);
  const keywordsByAspect = partitionAspectKeywordsSync(criterion, aspectLabels, { policy });

  const aspectResults = aspectLabels.map((aspect) => {
    // An aspect no keyword belongs to is judged by its label and concept domain, as in the ranker:
    // borrowing the sibling's keywords would let "Dank" prove "Zusage".
    const keywords = keywordsByAspect[aspect] || [];
    const evidence = resolveAspectEvidence(criterion, aspect);
    const score = computeDeterministicFallbackScore({ label: aspect, keywords, evidence }, evalText, { policy });
    const coverage = policy.classifyScore(score);
    return {
      aspect,
      coverage,
      score: Number(score.toFixed(4)),
      matchedSentence: score >= policy.thresholds.partial ? evalText : '',
    };
  });

  const aggregated = aggregateCompoundResults(aspectResults, policy);
  const score = aggregated.coverage === 'full' ? 2 : (aggregated.coverage === 'partial' ? 1 : 0);

  return {
    score,
    matched: score > 0,
    rankerDetails: aggregated,
    missingAspects: aggregated.missingAspects,
    fulfilledAspects: aggregated.fulfilledAspects,
  };
}
