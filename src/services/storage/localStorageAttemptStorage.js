import { AttemptStorageInterface } from './attemptStorage.interface.js';

const DEFAULT_STORAGE_KEY = 'telc_exam_attempts_v1';
const MAX_STORED_ATTEMPTS = 150;

/**
 * Browser LocalStorage implementation of AttemptStorageInterface.
 * Stores all exam attempt history entirely on the client side.
 */
export class LocalStorageAttemptStorage extends AttemptStorageInterface {
  constructor(storageKey = DEFAULT_STORAGE_KEY) {
    super();
    this.storageKey = storageKey;
  }

  _isStorageAvailable() {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  _loadRawList() {
    if (!this._isStorageAvailable()) return [];
    try {
      const serialized = window.localStorage.getItem(this.storageKey);
      if (!serialized) return [];
      const parsed = JSON.parse(serialized);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.warn('[LocalStorageAttemptStorage] Failed to parse attempts from localStorage:', err);
      return [];
    }
  }

  _saveRawList(list) {
    if (!this._isStorageAvailable()) return;
    try {
      const capped = list.slice(0, MAX_STORED_ATTEMPTS);
      window.localStorage.setItem(this.storageKey, JSON.stringify(capped));
    } catch (err) {
      console.warn('[LocalStorageAttemptStorage] Failed to save attempts to localStorage:', err);
    }
  }

  async saveAttempt(attempt) {
    const list = this._loadRawList();
    
    const record = {
      id: attempt.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`),
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

    // Prepend new attempt to the front
    const filtered = list.filter(item => item.id !== record.id);
    const updated = [record, ...filtered];
    
    this._saveRawList(updated);
    return record;
  }

  async getAttempts({ testType, examId, limit = 50 } = {}) {
    let list = this._loadRawList();

    if (testType) {
      list = list.filter(item => (item.test_type || 'lesen') === testType);
    }

    if (examId) {
      list = list.filter(item => item.exam_id === examId);
    }

    return list.slice(0, limit);
  }

  async getAttemptById(id) {
    if (!id) return null;
    const list = this._loadRawList();
    const found = list.find(item => item.id === id);
    return found ? JSON.parse(JSON.stringify(found)) : null;
  }

  async getExamAttemptCounts(testType) {
    const list = this._loadRawList();
    const counts = {};

    for (const item of list) {
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
    if (!id) return false;
    const list = this._loadRawList();
    const updated = list.filter(item => item.id !== id);
    if (updated.length !== list.length) {
      this._saveRawList(updated);
      return true;
    }
    return false;
  }

  async clearAttempts() {
    if (!this._isStorageAvailable()) return;
    try {
      window.localStorage.removeItem(this.storageKey);
    } catch (err) {
      console.warn('[LocalStorageAttemptStorage] Failed to clear localStorage:', err);
    }
  }
}
