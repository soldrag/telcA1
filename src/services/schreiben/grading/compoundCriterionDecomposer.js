/**
 * Compound Criterion Decomposer.
 * Decomposes multi-faceted examination criteria (e.g. "Personen und Zeitraum")
 * into atomic sub-aspects and aggregates them: full only when every aspect is full, otherwise partial or no.
 * Supports IRankerPolicy injection adhering to DIP.
 * Strictly complies with McConnell limits (<= 110 lines, <= 25 lines per function).
 */

import { defaultA1RankerPolicy } from './policies/a1RankerPolicy.js';

const CONJUNCTION_SPLIT_REGEX = /\s+(?:und|sowie|\/)\s+/i;
export const DEFAULT_FULL_THRESHOLD = 0.65;
export const DEFAULT_PARTIAL_THRESHOLD = 0.40;

export function splitCompoundCriterion(criterion) {
  const label = typeof criterion === 'string'
    ? criterion
    : (criterion?.label || criterion?.id || '');
  const trimmed = String(label || '').trim();
  if (!trimmed) return [];

  const parts = trimmed.split(CONJUNCTION_SPLIT_REGEX).map((p) => p.trim()).filter(Boolean);
  return parts.length > 0 ? parts : [trimmed];
}

export function isCompoundCriterion(criterion) {
  return splitCompoundCriterion(criterion).length > 1;
}

export function aggregateCompoundResults(
  aspectResults = [],
  policyOrFullThreshold = defaultA1RankerPolicy,
  partialThreshold = DEFAULT_PARTIAL_THRESHOLD
) {
  if (policyOrFullThreshold && typeof policyOrFullThreshold.aggregateCompound === 'function') {
    return policyOrFullThreshold.aggregateCompound(aspectResults);
  }

  const fullThresh = typeof policyOrFullThreshold === 'number' ? policyOrFullThreshold : DEFAULT_FULL_THRESHOLD;
  const partThresh = typeof partialThreshold === 'number' ? partialThreshold : DEFAULT_PARTIAL_THRESHOLD;

  if (!aspectResults || aspectResults.length === 0) {
    return { coverage: 'no', score: 0, matchedSentence: '', isCompound: false, aspects: [] };
  }
  if (aspectResults.length === 1) {
    return { ...aspectResults[0], isCompound: false };
  }

  const scores = aspectResults.map((r) => (typeof r.score === 'number' ? r.score : (r.coverage === 'full' ? 1 : r.coverage === 'partial' ? 0.5 : 0)));
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;

  const missingAspects = aspectResults
    .filter((r) => r.coverage === 'no' || (typeof r.score === 'number' && r.score < partThresh))
    .map((r) => r.aspect);

  const fulfilledAspects = aspectResults
    .filter((r) => r.coverage === 'full' || (typeof r.score === 'number' && r.score >= fullThresh))
    .map((r) => r.aspect);

  let coverage = 'no';
  let finalScore = minScore;

  if (minScore >= fullThresh && missingAspects.length === 0) {
    coverage = 'full';
    finalScore = Number(minScore.toFixed(4));
  } else if (maxScore >= partThresh) {
    coverage = 'partial';
    finalScore = Number(Math.min(0.55, Math.max(0.40, avgScore * 0.7)).toFixed(4));
  } else {
    coverage = 'no';
    finalScore = Number(maxScore.toFixed(4));
  }

  const bestMatchedSentence = aspectResults.find((r) => r.matchedSentence)?.matchedSentence || '';

  return {
    coverage,
    score: finalScore,
    matchedSentence: bestMatchedSentence,
    isCompound: true,
    aspects: aspectResults,
    missingAspects,
    fulfilledAspects,
  };
}
