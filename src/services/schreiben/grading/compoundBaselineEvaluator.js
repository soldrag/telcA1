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
import { defaultA1RankerPolicy } from './policies/a1RankerPolicy.js';

export function evaluateCompoundCriterionBaseline(criterion = {}, evalText = '') {
  const label = criterion.label || criterion.id || '';
  if (!isCompoundCriterion(label)) return null;

  const aspectLabels = splitCompoundCriterion(label);
  const keywordsByAspect = partitionAspectKeywordsSync(criterion, aspectLabels);

  const aspectResults = aspectLabels.map((aspect) => {
    const keywords = keywordsByAspect[aspect]?.length > 0
      ? keywordsByAspect[aspect]
      : (criterion?.keywords || []);
    const score = computeDeterministicFallbackScore(aspect, evalText, keywords);
    const coverage = defaultA1RankerPolicy.classifyScore(score);
    return {
      aspect,
      coverage,
      score: Number(score.toFixed(4)),
      matchedSentence: score >= defaultA1RankerPolicy.thresholds.partial ? evalText : '',
    };
  });

  const aggregated = aggregateCompoundResults(aspectResults, defaultA1RankerPolicy);
  const score = aggregated.coverage === 'full' ? 2 : (aggregated.coverage === 'partial' ? 1 : 0);

  return {
    score,
    matched: score > 0,
    rankerDetails: aggregated,
    missingAspects: aggregated.missingAspects,
    fulfilledAspects: aggregated.fulfilledAspects,
  };
}
