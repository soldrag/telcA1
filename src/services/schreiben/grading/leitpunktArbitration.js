/**
 * Leitpunkt Arbitration Policy.
 * Decides when a provider evaluates a Leitpunkt and how its verdict merges with the baseline:
 * - micro_ranker is a primary evaluator (all criteria, ~15 ms per sentence);
 * - generative LLM providers stay restricted to gray zones (seconds per call);
 * - a compound criterion with a missing aspect is capped at the partial level (A ∧ B: all aspects needed for full);
 * - a baseline level ≥ 1 is never lowered by the provider (isProtected records when that floor applied).
 */

import { isScoreInGrayZone, coverageToPoints, applyConfidenceFloor } from './stage2Leitpunkte.js';
import { PROVIDER_IDS } from '../../ai/types.js';

const COMPOUND_MISSING_ASPECT_CAP = 1;

export function isPrimaryRankerProvider(provider) {
  return provider?.id === PROVIDER_IDS.MICRO_RANKER;
}

export function shouldArbitrateLeitpunkt({ provider, effectiveSim, framePenalty }) {
  if (!provider || provider.id === PROVIDER_IDS.NONE || framePenalty > 0) return false;
  return isPrimaryRankerProvider(provider) || isScoreInGrayZone(effectiveSim);
}

function hasMissingCompoundAspect(verdict) {
  return Boolean(verdict?.isCompound && verdict?.missingAspects?.length > 0);
}

export function mergeArbitrationVerdict(baselineScore, verdict) {
  const rawScore = coverageToPoints(verdict?.coverage, baselineScore);
  const { score: guardedScore, isProtected } = applyConfidenceFloor(baselineScore, rawScore);
  const score = hasMissingCompoundAspect(verdict)
    ? Math.min(guardedScore, COMPOUND_MISSING_ASPECT_CAP)
    : guardedScore;
  return { score, rankerScore: rawScore, isProtected, arbitrated: score !== baselineScore || isProtected };
}

/**
 * @param {{ criterion: object, sentences: string[], baselineScore: number, provider: object,
 *   embedder?: object|null, rivalCriteria?: object[] }} params
 */
export async function arbitrateLeitpunkt({ criterion, sentences, baselineScore, provider, embedder = null, rivalCriteria = [] }) {
  if (!sentences?.length || !provider || provider.id === PROVIDER_IDS.NONE) {
    return { score: baselineScore, arbitrated: false, rankerDetails: null };
  }
  try {
    const verdict = isPrimaryRankerProvider(provider)
      ? await provider.classifyCoverage(criterion, sentences, { embedder, rivalCriteria })
      : await provider.classifyCoverage(criterion, sentences.join(' '));
    return { ...mergeArbitrationVerdict(baselineScore, verdict), rankerDetails: verdict || null };
  } catch (err) {
    console.warn('[LeitpunktArbitration] LP arbitration skipped on error:', err?.message || err);
    return { score: baselineScore, arbitrated: false, rankerDetails: null };
  }
}
