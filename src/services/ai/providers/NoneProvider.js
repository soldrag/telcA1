/**
 * NoneProvider: Explicit rule-based / limited mode.
 * Micro-tasks fall back to deterministic scoring without any model compute.
 */

import { AIProvider } from '../AIProvider.js';
import { PROVIDER_IDS } from '../types.js';

export class NoneProvider extends AIProvider {
  constructor() {
    super(PROVIDER_IDS.NONE, 'Regelbasiert (Eingeschränkter Modus)');
  }

  async isAvailable() {
    return true;
  }

  async classifyCoverage(lp, relevantSentences) {
    // Algorithmic threshold score is preserved
    return { coverage: 'fallback' };
  }
}
