/**
 * AI provider configuration: the primary grading provider.
 */

import { PROVIDER_IDS } from '../services/ai/types.js';

/** @returns {string} the provider that grades when no override is saved: the Micro-Ranker (System 1) */
export function getPrimaryAiProviderId() {
  return PROVIDER_IDS.MICRO_RANKER;
}
