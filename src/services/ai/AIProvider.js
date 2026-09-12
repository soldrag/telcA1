/**
 * Abstract base class defining the AIProvider contract.
 * AIProviders execute only 3 narrow micro-tasks; they never compute final scores.
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
   * Micro-task 1: Classify Leitpunkt coverage in gray zones.
   * @param {string|object} lp - Leitpunkt definition
   * @param {string} relevantSentences - Matched candidate sentences
   * @returns {Promise<{coverage: 'full'|'partial'|'no'}>}
   */
  async classifyCoverage(lp, relevantSentences) {
    throw new Error(`classifyCoverage not implemented for ${this.id}`);
  }

  /**
   * Micro-task 2: Propose grammar candidate fixes for a single sentence.
   * @param {string} sentence - Target sentence
   * @returns {Promise<Array<{original: string, correction: string, explanation: string}>>}
   */
  async proposeGrammarCandidates(sentence) {
    throw new Error(`proposeGrammarCandidates not implemented for ${this.id}`);
  }

  /**
   * Micro-task 3: Optional feedback polish based strictly on computed facts.
   * @param {object} facts - Precomputed scoring facts
   * @returns {Promise<string>}
   */
  async polishFeedback(facts) {
    throw new Error(`polishFeedback not implemented for ${this.id}`);
  }
}
