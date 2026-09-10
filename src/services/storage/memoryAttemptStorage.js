import { AttemptStorageInterface } from './attemptStorage.interface.js';

/**
 * In-memory implementation of AttemptStorageInterface.
 * Useful for unit testing, SSR, or fallback environments.
 */
export class MemoryAttemptStorage extends AttemptStorageInterface {
  constructor(initialAttempts = []) {
    super();
    this.attempts = [...initialAttempts];
  }

  async saveAttempt(attempt) {
    const record = {
      id: attempt.id || `mem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      exam_id: attempt.exam_id,
      exam_title: attempt.exam_title || attempt.results?.exam?.title || attempt.exam_id,
      test_type: attempt.test_type || attempt.results?.exam?.test_type || 'lesen',
      score: Number(attempt.score) || 0,
      total_questions: Number(attempt.total_questions) || 15,
      percentage: Number(attempt.percentage) || 0,
      passed: Boolean(attempt.passed),
      time_spent_seconds: Number(attempt.time_spent_seconds) || 0,
      answers: attempt.answers || {},
      results: attempt.results || null,
      created_at: attempt.created_at || new Date().toISOString(),
    };

    this.attempts = [record, ...this.attempts.filter(attemptRecord => attemptRecord.id !== record.id)];
    return record;
  }

  async getAttempts({ testType, examId, limit = 50 } = {}) {
    let list = [...this.attempts];
    if (testType) {
      list = list.filter(item => (item.test_type || 'lesen') === testType);
    }
    if (examId) {
      list = list.filter(item => item.exam_id === examId);
    }
    return list.slice(0, limit);
  }

  async getAttemptById(id) {
    const found = this.attempts.find(attemptRecord => attemptRecord.id === id);
    return found ? JSON.parse(JSON.stringify(found)) : null;
  }

  async getExamAttemptCounts(testType) {
    const counts = {};
    for (const item of this.attempts) {
      if (testType && (item.test_type || 'lesen') !== testType) continue;
      if (item.exam_id) {
        counts[item.exam_id] = (counts[item.exam_id] || 0) + 1;
      }
    }
    return counts;
  }

  async getLastAttempt(testType) {
    const attempts = await this.getAttempts({ testType, limit: 1 });
    return attempts[0] || null;
  }

  async deleteAttempt(id) {
    const before = this.attempts.length;
    this.attempts = this.attempts.filter(attemptRecord => attemptRecord.id !== id);
    return this.attempts.length !== before;
  }

  async clearAttempts() {
    this.attempts = [];
  }
}
