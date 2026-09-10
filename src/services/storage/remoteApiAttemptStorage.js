import { AttemptStorageInterface } from './attemptStorage.interface.js';
import { fetchUserAttempts, fetchAttemptDetail } from '../api.js';

/**
 * Remote API / Database implementation of AttemptStorageInterface.
 * Can be switched on if backend persistence is required in the future.
 */
export class RemoteApiAttemptStorage extends AttemptStorageInterface {
  async saveAttempt(attempt) {
    // In remote mode, submissions are already persisted on the server during submit.
    return attempt;
  }

  async getAttempts({ testType, examId, limit = 50 } = {}) {
    const data = await fetchUserAttempts();
    let list = data.attempts || [];
    if (testType) {
      list = list.filter(item => (item.test_type || 'lesen') === testType);
    }
    if (examId) {
      list = list.filter(item => item.exam_id === examId);
    }
    return list.slice(0, limit);
  }

  async getAttemptById(id) {
    return await fetchAttemptDetail(id);
  }

  async getExamAttemptCounts(testType) {
    const attempts = await this.getAttempts({ testType, limit: 1000 });
    const counts = {};
    for (const item of attempts) {
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
    console.warn('[RemoteApiAttemptStorage] Remote attempt deletion not supported by API');
    return false;
  }

  async clearAttempts() {
    console.warn('[RemoteApiAttemptStorage] Remote attempt clear not supported by API');
  }
}
