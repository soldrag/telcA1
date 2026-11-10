/**
 * Abstract base class of a grading provider: it names how a letter can be read here — with the embedding model or
 * without it (limited mode). Providers compute no scores; the Leitpunkt assessor reads, the regulation scores.
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

  /** Releases what the provider holds (model sessions, caches). */
  async dispose() {}
}
