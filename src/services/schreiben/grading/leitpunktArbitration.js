/**
 * Leitpunkt Arbitration Policy.
 * Decides when the ranker evaluates a Leitpunkt and how its verdict merges with the baseline:
 * - micro_ranker is the primary evaluator (all criteria, ~15 ms per sentence); the limited mode (`none`) never arbitrates;
 * - a compound criterion with a missing aspect is capped at the partial level (A ∧ B: all aspects needed for full);
 * - an untrusted verdict never lowers a baseline level ≥ 1 (isProtected records when that floor applied);
 * - the ranker is the arbiter: its 'no' verdict overrides the keyword baseline, and a compound
 *   point is capped at partial when the ranker vetoed an aspect that only keywords supported
 *   (both only when the level policy trusts the verdict on these sentences, see IRankerPolicy.isVerdictReliable);
 * - a baseline resting on sentence similarity alone (no keyword, concept or structured evidence) is only a
 *   topic hint: the ranker's verdict is not floored by that baseline.
 */

import { coverageToPoints, applyConfidenceFloor } from './stage2Leitpunkte.js';
import { PROVIDER_IDS } from '../../ai/types.js';

const COMPOUND_MISSING_ASPECT_CAP = 1;

function isPrimaryRankerProvider(provider) {
  return provider?.id === PROVIDER_IDS.MICRO_RANKER;
}

/**
 * @param {{ provider: object, framePenalty: number }} params
 */
export function shouldArbitrateLeitpunkt({ provider, framePenalty }) {
  return isPrimaryRankerProvider(provider) && !(framePenalty > 0);
}

function hasUnconfirmedCompoundAspect(verdict, rankerIsArbiter) {
  if (!verdict?.isCompound) return false;
  if (verdict.missingAspects?.length > 0) return true;
  return rankerIsArbiter && (verdict.aspects || []).some((a) => a.rankerVeto);
}

/**
 * @param {number} baselineScore
 * @param {object} verdict - provider coverage verdict
 * @param {{ rankerIsArbiter?: boolean, isSimilarityOnly?: boolean }} [options]
 */
export function mergeArbitrationVerdict(baselineScore, verdict, { rankerIsArbiter = false, isSimilarityOnly = false } = {}) {
  const rawScore = coverageToPoints(verdict?.coverage, baselineScore);
  if ((rankerIsArbiter || isSimilarityOnly) && verdict?.coverage === 'no') {
    return { score: rawScore, rankerScore: rawScore, isProtected: false, arbitrated: rawScore !== baselineScore };
  }
  const { score: guardedScore, isProtected } = applyConfidenceFloor(baselineScore, rawScore);
  const score = hasUnconfirmedCompoundAspect(verdict, rankerIsArbiter)
    ? Math.min(guardedScore, COMPOUND_MISSING_ASPECT_CAP)
    : guardedScore;
  return { score, rankerScore: rawScore, isProtected, arbitrated: score !== baselineScore || isProtected };
}

/**
 * @param {{ criterion: object, sentences: string[], baselineScore: number, provider: object,
 *   embedder?: object|null, rivalCriteria?: object[], policy?: object, isSimilarityOnly?: boolean }} params
 *   - policy: the task level's ranker policy
 */
export async function arbitrateLeitpunkt({ criterion, sentences, baselineScore, provider, embedder = null, rivalCriteria = [], policy, isSimilarityOnly = false }) {
  if (!sentences?.length || !isPrimaryRankerProvider(provider)) {
    return { score: baselineScore, arbitrated: false, rankerDetails: null };
  }
  try {
    const rankerIsArbiter = provider.canOverruleBaseline(sentences, policy);
    const verdict = await provider.classifyCoverage(criterion, sentences, { embedder, rivalCriteria, policy });
    return { ...mergeArbitrationVerdict(baselineScore, verdict, { rankerIsArbiter, isSimilarityOnly }), rankerDetails: verdict || null };
  } catch (err) {
    console.warn('[LeitpunktArbitration] LP arbitration skipped on error:', err?.message || err);
    return { score: baselineScore, arbitrated: false, rankerDetails: null };
  }
}
