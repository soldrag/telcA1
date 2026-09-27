/**
 * Abstract base class defining the AIProvider contract.
 * AIProviders execute one narrow micro-task (Leitpunkt coverage); they never compute final scores.
 */

export class AIProvider {
  /**
   * @param {string} id - Provider identifier
   * @param {string} name - Human-readable label
   */
  constructor(id, name) {
    if (!id || !name) {
      throw new Error('AIProvider requires id and name');
    }
    this.id = id;
    this.name = name;
  }

  /**
   * Check if this provider can execute in the current environment.
   * @returns {Promise<boolean>}
   */
  async isAvailable() {
    return false;
  }

  /**
   * Micro-task 1: Classify Leitpunkt coverage.
   * @param {string|object} lp - Leitpunkt definition
   * @param {string} relevantSentences - Matched candidate sentences
   * @returns {Promise<{coverage: 'full'|'partial'|'no'}>}
   */
  async classifyCoverage(lp, relevantSentences) {
    throw new Error(`classifyCoverage not implemented for ${this.id}`);
  }
}
