/**
 * Abstract Interface Contract for CEFR Ranker Policies (DIP).
 * All CEFR level-specific regulations (A1, A2, B1) implement this contract.
 * Strictly adheres to McConnell limits (<= 60 lines, <= 15 lines per function).
 */

/**
 * @typedef {Object} CoverageThresholds
 * @property {number} full - Minimum score for 'full' coverage
 * @property {number} partial - Minimum score for 'partial' coverage
 */

/**
 * @typedef {Object} AspectEvaluationResult
 * @property {string} aspect
 * @property {'full'|'partial'|'no'} coverage
 * @property {number} score
 * @property {string} [matchedSentence]
 */

/**
 * @typedef {Object} CompoundAggregationResult
 * @property {'full'|'partial'|'no'} coverage
 * @property {number} score
 * @property {string} matchedSentence
 * @property {boolean} isCompound
 * @property {AspectEvaluationResult[]} aspects
 * @property {string[]} missingAspects
 * @property {string[]} fulfilledAspects
 */

export class IRankerPolicy {
  get level() {
    throw new Error('IRankerPolicy.level getter must be implemented');
  }

  get thresholds() {
    throw new Error('IRankerPolicy.thresholds getter must be implemented');
  }

  get maxPointsPerLeitpunkt() {
    throw new Error('IRankerPolicy.maxPointsPerLeitpunkt getter must be implemented');
  }

  classifyScore(rawScore) {
    throw new Error('IRankerPolicy.classifyScore must be implemented');
  }

  aggregateCompound(aspectResults) {
    throw new Error('IRankerPolicy.aggregateCompound must be implemented');
  }

  /**
   * Maps a raw embedding cosine onto the policy score scale used by classifyScore.
   * Identity by default so policies without neural calibration keep working.
   * @param {number} similarity
   * @returns {number}
   */
  calibrateNeuralScore(similarity) {
    return similarity;
  }

  calculateGrammarPenalty(errorsCount, wordCount) {
    throw new Error('IRankerPolicy.calculateGrammarPenalty must be implemented');
  }
}
