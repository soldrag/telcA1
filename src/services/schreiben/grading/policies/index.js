/**
 * CEFR Ranker Policy Registry & Factory.
 * Provides level-specific policies with A1 active and A2/B1 extension points.
 * Strictly complies with McConnell limits (<= 60 lines, <= 20 lines per function).
 */

import { IRankerPolicy } from './rankerPolicyInterface.js';
import { A1RankerPolicy, defaultA1RankerPolicy } from './a1RankerPolicy.js';

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
 * Retrieves the ranker policy for a given CEFR level.
 * Falls back to defaultA1RankerPolicy if level is not registered yet.
 * @param {string} [level='A1']
 * @returns {IRankerPolicy}
 */
export function getRankerPolicy(level = 'A1') {
  const normLevel = String(level || 'A1').toUpperCase().trim();
  const policy = POLICY_REGISTRY.get(normLevel);
  if (policy) {
    return policy;
  }
  console.warn(`[CefrPolicyRegistry] Policy for level "${normLevel}" not yet registered. Using A1 policy fallback.`);
  return defaultA1RankerPolicy;
}
