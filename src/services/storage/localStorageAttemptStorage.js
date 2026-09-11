import { AttemptStorageInterface } from './attemptStorage.interface.js';

const DEFAULT_STORAGE_KEY = 'telc_exam_attempts_v1';
const MAX_STORED_ATTEMPTS = 150;

function extractAttemptTitle(attempt) {
  if (attempt?.exam_title) return attempt.exam_title;
  const nestedTitle = attempt?.results?.exam?.title;
  if (nestedTitle) return nestedTitle;
  return attempt?.exam_id || 'unknown';
}

function extractTestType(attempt) {
  if (attempt?.test_type) return attempt.test_type;
  const nestedType = attempt?.results?.exam?.test_type;
  if (nestedType) return nestedType;
  return 'lesen';
}

function generateAttemptId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `attempt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

export class LocalStorageAttemptStorage extends AttemptStorageInterface {
  constructor(storageKey = DEFAULT_STORAGE_KEY) {
    super();
    this.storageKey = storageKey;
    this._memoryFallback = [];
  }

  _isStorageAvailable() {
    try {
      return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined' && window.localStorage !== null;
    } catch {
      return false;
    }
  }

  _loadRawList() {
    if (!this._isStorageAvailable()) return [...this._memoryFallback];
    try {
      const serialized = window.localStorage.getItem(this.storageKey);
      if (!serialized) return [...this._memoryFallback];
      const parsed = JSON.parse(serialized);
      return Array.isArray(parsed) ? parsed : [...this._memoryFallback];
    } catch (parseError) {
      console.warn('[LocalStorageAttemptStorage] Failed to parse stored attempts', parseError);
      return [...this._memoryFallback];
    }
  }

  _saveRawList(attemptsList) {
    const cappedList = attemptsList.slice(0, MAX_STORED_ATTEMPTS);
    this._memoryFallback = cappedList;
    if (!this._isStorageAvailable()) return;
    try {
      window.localStorage.setItem(this.storageKey, JSON.stringify(cappedList));
    } catch (storageError) {
      console.warn('[LocalStorageAttemptStorage] Failed to save attempts to localStorage', storageError);
    }
  }

  async saveAttempt(attempt) {
    const attemptsList = this._loadRawList();
    
    const record = {
      id: attempt.id || generateAttemptId(),
      exam_id: attempt.exam_id,
      exam_title: extractAttemptTitle(attempt),
      test_type: extractTestType(attempt),
      score: Number(attempt.score) || 0,
      total_questions: Number(attempt.total_questions) || 15,
      percentage: Number(attempt.percentage) || 0,
      passed: Boolean(attempt.passed),
      time_spent_seconds: Number(attempt.time_spent_seconds) || 0,
      answers: attempt.answers || {},
      results: attempt.results || null,
      created_at: attempt.created_at || new Date().toISOString(),
    };

    const remainingAttempts = attemptsList.filter(item => item.id !== record.id);
    const updatedList = [record, ...remainingAttempts];
    
    this._saveRawList(updatedList);
    return record;
  }

  async getAttempts({ testType, examId, limit = 50 } = {}) {
    let attemptsList = this._loadRawList();

    if (testType) {
      attemptsList = attemptsList.filter(item => (item.test_type || 'lesen') === testType);
    }

    if (examId) {
      attemptsList = attemptsList.filter(item => item.exam_id === examId);
    }

    return attemptsList.slice(0, limit);
  }

  async getAttemptById(id) {
    if (!id) return null;
    const attemptsList = this._loadRawList();
    const foundAttempt = attemptsList.find(item => item.id === id);
    return foundAttempt ? JSON.parse(JSON.stringify(foundAttempt)) : null;
  }

  async getExamAttemptCounts(testType) {
    const attemptsList = this._loadRawList();
    const counts = {};

    for (const item of attemptsList) {
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
    const attemptsList = this._loadRawList();
    const filteredList = attemptsList.filter(item => item.id !== id);
    if (filteredList.length !== attemptsList.length) {
      this._saveRawList(filteredList);
      return true;
    }
    return false;
  }

  async clearAttempts() {
    this._memoryFallback = [];
    if (!this._isStorageAvailable()) return;
    try {
      window.localStorage.removeItem(this.storageKey);
    } catch (storageError) {
      console.warn('[LocalStorageAttemptStorage] Failed to clear attempts from localStorage', storageError);
    }
  }
}
