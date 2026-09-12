/**
 * NoneProvider: Explicit rule-based / limited mode.
 * Micro-tasks fall back to deterministic scoring without any LLM compute.
 */

import { AIProvider } from '../AIProvider.js';
import { PROVIDER_IDS } from '../types.js';
import { assembleDeterministicFeedback } from '../../schreiben/grading/stage4Feedback.js';

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

  async proposeGrammarCandidates(sentence) {
    // Zero LLM hallucinations, rely purely on deterministic grammar checks
    return [];
  }

  async polishFeedback(facts = {}) {
    // Deterministic template feedback bank
    return assembleDeterministicFeedback(facts);
  }
}
