/**
 * Abstract contract for an exam regulation of Schreiben (DIP).
 * Teil 1: it decides from comparison facts whether a form answer counts. Teil 2: it turns detector
 * evidence (coverage levels 0/1/2) into official exam points.
 * Detectors decide *what* is in the answer; the regulation decides *what it is worth*.
 * Each level (A1, A2, …) has its own implementation and its own reglament/*.md.
 */

/**
 * @typedef {Object} Teil2Evidence
 * @property {number[]} leitpunktLevels - Coverage level per Leitpunkt: 2 full, 1 partial, 0 none
 * @property {number} anrede - Salutation level 0/1/2
 * @property {number} gruss - Closing level 0/1/2
 * @property {Array} [grammarErrors] - Available to regulations that grade formal accuracy
 * @property {number} [wordCount]
 * @property {boolean} [isUnratable] - Gibberish or empty text
 * @property {import('../grading/letterContentFacts.js').LetterContentFacts} [content] - What the body
 *   states; a regulation may void Leitpunkte by it (no statement at all, a letter on another task)
 */

/** Why a regulation gave every Leitpunkt 0 regardless of its coverage level. */
export const LEITPUNKTE_VOID_REASONS = Object.freeze({
  NO_PREDICATION: 'NO_PREDICATION',
  OFF_TOPIC: 'OFF_TOPIC',
});

/**
 * @typedef {Object} ScoredCriterion
 * @property {number} level
 * @property {number} points
 * @property {number} maxPoints
 */

/**
 * @typedef {Object} Teil2Score
 * @property {ScoredCriterion[]} leitpunkte
 * @property {ScoredCriterion & {rating: string}} kg - Kommunikative Gestaltung
 * @property {number} total
 * @property {number} maxPoints
 * @property {string|null} leitpunkteVoidReason - a LEITPUNKTE_VOID_REASONS value, or null
 */

export class ISchreibenRegulation {
  get id() {
    throw new Error('ISchreibenRegulation.id getter must be implemented');
  }

  get level() {
    throw new Error('ISchreibenRegulation.level getter must be implemented');
  }

  get maxPoints() {
    throw new Error('ISchreibenRegulation.maxPoints getter must be implemented');
  }

  /** Training orientation mark for Teil 2, not an official pass threshold. */
  get trainingPassMark() {
    throw new Error('ISchreibenRegulation.trainingPassMark getter must be implemented');
  }

  /**
   * Schreiben Teil 1: whether a form answer counts for one expected answer.
   * @param {import('../schreibenFormAnswerFacts.js').FormAnswerFacts} facts
   * @returns {boolean}
   */
  acceptsTeil1Answer(facts) {
    throw new Error('ISchreibenRegulation.acceptsTeil1Answer must be implemented');
  }

  /**
   * @param {Teil2Evidence} evidence
   * @returns {Teil2Score}
   */
  scoreTeil2(evidence) {
    throw new Error('ISchreibenRegulation.scoreTeil2 must be implemented');
  }
}
