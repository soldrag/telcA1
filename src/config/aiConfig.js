/**
 * AI provider configuration: the primary grading provider.
 */

import { PROVIDER_IDS } from '../services/ai/types.js';

export const AI_CONFIG = {
  // Primary evaluation engine: Micro-Ranker (System 1 Decision Model)
  PRIMARY_PROVIDER: PROVIDER_IDS.MICRO_RANKER,
};

/**
 * Returns the configured primary AI provider ID.
 * @returns {string}
 */
export function getPrimaryAiProviderId() {
  return AI_CONFIG.PRIMARY_PROVIDER || PROVIDER_IDS.MICRO_RANKER;
}
