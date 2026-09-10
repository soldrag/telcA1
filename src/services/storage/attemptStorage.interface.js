/**
 * @typedef {Object} AttemptRecord
 * @property {string} id - Unique identifier of the attempt
 * @property {string} exam_id - Exam ID (e.g. 'modellsatz-1')
 * @property {string} [exam_title] - Title of the exam
 * @property {string} [test_type] - Type of the test (e.g. 'lesen', 'schreiben')
 * @property {number} score - Total scored points
 * @property {number} total_questions - Number of total questions
 * @property {number} percentage - Percentage score (0 - 100)
 * @property {boolean|number} passed - Whether the exam was passed
 * @property {number} time_spent_seconds - Seconds spent on the exam
 * @property {Record<string, string>} answers - User submitted answers map
 * @property {Object} results - Graded review payload including teil breakdown & explanations
 * @property {string} created_at - ISO 8601 timestamp string
 */

/**
 * Base Abstract Interface for Exam Attempts Storage.
 * Implementations: LocalStorageAttemptStorage, RemoteApiAttemptStorage, MemoryAttemptStorage.
 */
export class AttemptStorageInterface {
  /**
   * Saves an attempt record.
   * @param {AttemptRecord} attempt
   * @returns {Promise<AttemptRecord>}
   */
  async saveAttempt(attempt) {
    throw new Error('saveAttempt() must be implemented');
  }

  /**
   * Retrieves a list of attempts sorted with newest first.
   * @param {Object} [options]
   * @param {string} [options.testType] - Filter by test type
   * @param {string} [options.examId] - Filter by exam id
   * @param {number} [options.limit] - Limit count
   * @returns {Promise<AttemptRecord[]>}
   */
  async getAttempts(options = {}) {
    throw new Error('getAttempts() must be implemented');
  }

  /**
   * Retrieves a single attempt by ID with full details.
   * @param {string} id
   * @returns {Promise<AttemptRecord|null>}
   */
  async getAttemptById(id) {
    throw new Error('getAttemptById() must be implemented');
  }

  /**
   * Returns a map of examId -> count of attempts.
   * @param {string} [testType]
   * @returns {Promise<Record<string, number>>}
   */
  async getExamAttemptCounts(testType) {
    throw new Error('getExamAttemptCounts() must be implemented');
  }

  /**
   * Returns the most recent attempt.
   * @param {string} [testType]
   * @returns {Promise<AttemptRecord|null>}
   */
  async getLastAttempt(testType) {
    throw new Error('getLastAttempt() must be implemented');
  }

  /**
   * Deletes a specific attempt by ID.
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  async deleteAttempt(id) {
    throw new Error('deleteAttempt() must be implemented');
  }

  /**
   * Clears all stored attempts.
   * @returns {Promise<void>}
   */
  async clearAttempts() {
    throw new Error('clearAttempts() must be implemented');
  }
}
