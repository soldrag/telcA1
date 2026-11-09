/**
 * Compound Criterion Decomposer.
 * A criterion is scored in the parts its rubric declares (`aspects`, e.g. "Personen" and "Zeitraum"), never in parts
 * guessed from the label wording; the parts are aggregated: full only when every aspect is full, otherwise partial or no.
 * Aggregation is the level policy's rule (IRankerPolicy.aggregateCompound), injected by the caller.
 * Strictly complies with McConnell limits (<= 110 lines, <= 25 lines per function).
 */

import { requireLevelPort } from './levelPorts.js';

const CONJUNCTION_SPLIT_REGEX = /\s+(?:und|sowie|\/)\s+/i;

/** The parts a criterion is scored in: its declared aspects, or the criterion itself. */
export function criterionAspectLabels(criterion = {}) {
  const declared = (criterion?.aspects || []).map((a) => a?.label).filter(Boolean);
  return declared.length > 1 ? declared : [criterion?.label || criterion?.id || ''];
}

export function isCompoundCriterion(criterion) {
  return criterionAspectLabels(criterion).length > 1;
}

/**
 * Parts of a label ("Personen und Zeitraum"). Only the another-purpose review reads them: its trained units are
 * keyed by them (unitEvidence.js), and they go with it.
 */
export function splitCriterionLabel(label = '') {
  const trimmed = String(label || '').trim();
  if (!trimmed) return [];
  const parts = trimmed.split(CONJUNCTION_SPLIT_REGEX).map((p) => p.trim()).filter(Boolean);
  return parts.length > 0 ? parts : [trimmed];
}

/**
 * Aggregates aspect verdicts by the level's rule (A ∧ B: full only when every aspect is full).
 * @param {object[]} aspectResults
 * @param {{ aggregateCompound: Function }} policy - the level's ranker policy
 */
export function aggregateCompoundResults(aspectResults = [], policy) {
  return requireLevelPort(policy, 'aggregateCompoundResults: policy').aggregateCompound(aspectResults);
}
