/**
 * Compound Criterion Decomposer.
 * Decomposes multi-faceted examination criteria (e.g. "Personen und Zeitraum")
 * into atomic sub-aspects and aggregates them: full only when every aspect is full, otherwise partial or no.
 * Aggregation is the level policy's rule (IRankerPolicy.aggregateCompound), injected by the caller.
 * Strictly complies with McConnell limits (<= 110 lines, <= 25 lines per function).
 */

import { requireLevelPort } from './levelPorts.js';

const CONJUNCTION_SPLIT_REGEX = /\s+(?:und|sowie|\/)\s+/i;

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

/**
 * Aggregates aspect verdicts by the level's rule (A ∧ B: full only when every aspect is full).
 * @param {object[]} aspectResults
 * @param {{ aggregateCompound: Function }} policy - the level's ranker policy
 */
export function aggregateCompoundResults(aspectResults = [], policy) {
  return requireLevelPort(policy, 'aggregateCompoundResults: policy').aggregateCompound(aspectResults);
}
