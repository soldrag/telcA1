/**
 * AI Provider & Evaluation Feature Flags.
 * Centralized project-level configuration controlling active AI capabilities.
 * Strictly complies with McConnell limits (<= 150 lines, <= 25 lines per function).
 */

import { PROVIDER_IDS } from '../services/ai/types.js';

export const AI_CONFIG = {
  // Primary evaluation engine: Micro-Ranker (System 1 Decision Model)
  PRIMARY_PROVIDER: PROVIDER_IDS.MICRO_RANKER,

  // Heavy generative LLMs (WebLLM Qwen 0.6B / Client WebGPU)
  // Disabled by default at project settings level to maintain instant latency & zero download overhead
  ENABLE_GENERATIVE_LLM: false,

  // Comparative A/B testing buttons in the UI
  ENABLE_AB_TESTING_UI: false,

  // Allow fallback to NoneProvider if required
  ALLOW_FALLBACK_TO_NONE: true,
};

/**
 * Checks whether generative LLMs are enabled (respects optional localStorage override for devs).
 * @returns {boolean}
 */
export function isGenerativeLlmEnabled() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const override = window.localStorage.getItem('telc_enable_generative_llm');
      if (override !== null) return override === 'true';
    }
  } catch {}
  return AI_CONFIG.ENABLE_GENERATIVE_LLM;
}

/**
 * Checks whether comparative A/B testing UI controls should be rendered.
 * @returns {boolean}
 */
export function isAbTestingUiEnabled() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const override = window.localStorage.getItem('telc_enable_ab_testing_ui');
      if (override !== null) return override === 'true';
    }
  } catch {}
  return AI_CONFIG.ENABLE_AB_TESTING_UI;
}

/**
 * Returns the configured primary AI provider ID.
 * @returns {string}
 */
export function getPrimaryAiProviderId() {
  return AI_CONFIG.PRIMARY_PROVIDER || PROVIDER_IDS.MICRO_RANKER;
}
