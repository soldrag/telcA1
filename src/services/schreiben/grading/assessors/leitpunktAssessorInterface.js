/**
 * Port: a Leitpunkt assessor reads a letter body against a task's Leitpunkte and reports coverage facts per
 * Leitpunkt (level 0/1/2, the sentence that shows it, a diagnostic code). It decides no points: the exam
 * regulation prices the levels (regulations/). The pipeline picks an assessor by `options.leitpunktEngine`.
 */

/**
 * @typedef {Object} LeitpunktVerdict
 * @property {string} id
 * @property {string} label
 * @property {0|1|2} score - coverage level
 * @property {string} matchedSentence - the letter span that shows the coverage ('' when none)
 * @property {string} diagnosticCode - a DIAGNOSTIC_CODES LP_* value
 */

/**
 * @typedef {Object} LeitpunktAssessment
 * @property {LeitpunktVerdict[]} items - one per criterion, in rubric order
 * @property {Array} semanticErrors - meaning distortions found on the way (feedback only)
 * @property {boolean} modelUsed - the embedding model read every body sentence
 * @property {string|null} modelFailureDetail - the first model failure's message, null when none
 * @property {boolean|null} [servesTaskPurpose] - the assessor's own reading of the letter's purpose, when it has one
 */

/**
 * @typedef {Object} LeitpunktAssessmentInput
 * @property {object} question - the task
 * @property {object[]} criteria - resolveLeitpunktCriteria(question)
 * @property {string[]} bodySentences - stage 0 body sentences
 * @property {string} [letterText] - the whole body as one text (the letter's purpose is read on it)
 * @property {object} provider - the AI provider the registry chose
 * @property {object} policy - the level's ranker policy
 * @property {object} [userSegments]
 * @property {Function|false} [customExtractor]
 * @property {Function} [evidenceExtractor] - a sentence-embedding extractor to use instead of loading the model
 * @property {Function} [onModelDownload]
 */

export class ILeitpunktAssessor {
  /** @returns {string} engine id, a LEITPUNKT_ENGINES value */
  get id() {
    throw new Error('ILeitpunktAssessor.id getter must be implemented');
  }

  /**
   * @param {LeitpunktAssessmentInput} input
   * @returns {Promise<LeitpunktAssessment>}
   */
  async assess(input) {
    throw new Error(`ILeitpunktAssessor.assess must be implemented (${typeof input})`);
  }
}
