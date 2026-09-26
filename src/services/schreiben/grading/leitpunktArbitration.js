/**
 * Leitpunkt Arbitration Policy.
 * Decides when a provider evaluates a Leitpunkt and how its verdict merges with the baseline:
 * - micro_ranker is a primary evaluator (all criteria, ~15 ms per sentence);
 * - generative LLM providers stay restricted to gray zones (seconds per call);
 * - a compound criterion with a missing aspect is capped at the partial level (A ∧ B: all aspects needed for full);
 * - gray-zone providers never lower a baseline level ≥ 1 (isProtected records when that floor applied);
 * - the primary ranker is the arbiter: its 'no' verdict overrides the keyword baseline, and a compound
 *   point is capped at partial when the ranker finds any aspect less than fully covered (vetoed or partial:
 *   full needs every aspect)
 *   (both only when the level policy trusts the verdict on these sentences, see IRankerPolicy.isVerdictReliable).
 */

import { isScoreInGrayZone, coverageToPoints, applyConfidenceFloor } from './stage2Leitpunkte.js';
import { SIMILARITY_T2 } from './types.js';
import { PROVIDER_IDS } from '../../ai/types.js';

const COMPOUND_MISSING_ASPECT_CAP = 1;

export function isPrimaryRankerProvider(provider) {
  return provider?.id === PROVIDER_IDS.MICRO_RANKER;
}

// Whether a gray-zone provider has anything to decide. For a compound criterion the keyword aspects
// settle a missing aspect (0), while a full similarity capped at partial means the aspects disagree.
function isBaselineUndecided({ effectiveSim, baselineScore, isCompound }) {
  if (!isCompound) return isScoreInGrayZone(effectiveSim);
  if (baselineScore === 0) return false;
  if (baselineScore === 1 && effectiveSim >= SIMILARITY_T2) return true;
  return isScoreInGrayZone(effectiveSim);
}

/**
 * @param {{ provider: object, effectiveSim: number, framePenalty: number,
 *   baselineScore?: number, isCompound?: boolean }} params
 */
export function shouldArbitrateLeitpunkt({ provider, effectiveSim, framePenalty, baselineScore, isCompound = false }) {
  if (!provider || provider.id === PROVIDER_IDS.NONE || framePenalty > 0) return false;
  return isPrimaryRankerProvider(provider) || isBaselineUndecided({ effectiveSim, baselineScore, isCompound });
}

function hasUnconfirmedCompoundAspect(verdict, rankerIsArbiter) {
  if (!verdict?.isCompound) return false;
  if (verdict.missingAspects?.length > 0) return true;
  return rankerIsArbiter && (verdict.aspects || []).some((a) => a.rankerVeto || a.coverage !== 'full');
}

/**
 * @param {number} baselineScore
 * @param {object} verdict - provider coverage verdict
 * @param {{ rankerIsArbiter?: boolean }} [options]
 */
export function mergeArbitrationVerdict(baselineScore, verdict, { rankerIsArbiter = false } = {}) {
  const rawScore = coverageToPoints(verdict?.coverage, baselineScore);
  if (rankerIsArbiter && verdict?.coverage === 'no') {
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
 *   embedder?: object|null, rivalCriteria?: object[], policy?: object }} params - policy: the task level's ranker policy
 */
export async function arbitrateLeitpunkt({ criterion, sentences, baselineScore, provider, embedder = null, rivalCriteria = [], policy }) {
  if (!sentences?.length || !provider || provider.id === PROVIDER_IDS.NONE) {
    return { score: baselineScore, arbitrated: false, rankerDetails: null };
  }
  try {
    const rankerIsArbiter = isPrimaryRankerProvider(provider) && provider.canOverruleBaseline(sentences, policy);
    const verdict = isPrimaryRankerProvider(provider)
      ? await provider.classifyCoverage(criterion, sentences, { embedder, rivalCriteria, policy })
      : await provider.classifyCoverage(criterion, sentences.join(' '));
    return { ...mergeArbitrationVerdict(baselineScore, verdict, { rankerIsArbiter }), rankerDetails: verdict || null };
  } catch (err) {
    console.warn('[LeitpunktArbitration] LP arbitration skipped on error:', err?.message || err);
    return { score: baselineScore, arbitrated: false, rankerDetails: null };
  }
}
