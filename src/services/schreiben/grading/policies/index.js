/**
 * CEFR Ranker Policy Registry & Factory.
 * Provides level-specific policies with A1 active and A2/B1 extension points.
 * Strictly complies with McConnell limits (<= 60 lines, <= 20 lines per function).
 */

import { IRankerPolicy } from './rankerPolicyInterface.js';
import { A1RankerPolicy, defaultA1RankerPolicy } from './a1RankerPolicy.js';
import { resolveTaskLevel } from '../../taskLevel.js';

export { IRankerPolicy, A1RankerPolicy, defaultA1RankerPolicy };

const POLICY_REGISTRY = new Map([
  ['A1', defaultA1RankerPolicy],
]);

/**
 * Registers or overrides a CEFR level policy.
 * @param {string} level
 * @param {IRankerPolicy} policyInstance
 */
export function registerRankerPolicy(level, policyInstance) {
  if (!level || !(policyInstance instanceof IRankerPolicy)) {
    throw new TypeError('Invalid policy: must be an instance of IRankerPolicy with valid level');
  }
  POLICY_REGISTRY.set(String(level).toUpperCase(), policyInstance);
}

/**
 * @param {string} [level] - the task level; a missing level is a legacy A1 task (taskLevel.js)
 * @returns {IRankerPolicy}
 * @throws {RangeError} for a level without a registered policy
 */
export function getRankerPolicy(level) {
  return POLICY_REGISTRY.get(resolveTaskLevel(level, POLICY_REGISTRY, 'getRankerPolicy'));
}
