/**
 * Synchronous Baseline Evaluator for Compound Criteria.
 * Evaluates multi-faceted Leitpunkte (e.g. "Personen und Zeitraum") in Stage 0-2 baseline
 * by checking each atomic sub-aspect against A1 concept domains and rubric keywords.
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
import { defaultA1RankerPolicy } from './policies/a1RankerPolicy.js';

/** policy: the level's ranker policy (coverage thresholds and compound aggregation). */
export function evaluateCompoundCriterionBaseline(criterion = {}, evalText = '', { policy = defaultA1RankerPolicy } = {}) {
  const label = criterion.label || criterion.id || '';
  if (!isCompoundCriterion(label)) return null;

  const aspectLabels = splitCompoundCriterion(label);
  const keywordsByAspect = partitionAspectKeywordsSync(criterion, aspectLabels);

  const aspectResults = aspectLabels.map((aspect) => {
    const keywords = keywordsByAspect[aspect]?.length > 0
      ? keywordsByAspect[aspect]
      : (criterion?.keywords || []);
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
