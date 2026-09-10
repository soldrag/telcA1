import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { MemoryAttemptStorage } from '../src/services/storage/memoryAttemptStorage.js';
import { LocalStorageAttemptStorage } from '../src/services/storage/localStorageAttemptStorage.js';
import { filterLeastAttemptedExams, getNextBalancedExam } from '../src/utils/examBalancer.js';

describe('Storage Layer & Pluggable Providers', () => {
  let memoryStorage;

  beforeEach(() => {
    memoryStorage = new MemoryAttemptStorage();
  });

  it('saves and retrieves attempts with ordering and counts', async () => {
    const attempt1 = await memoryStorage.saveAttempt({
      exam_id: 'modellsatz-1',
      exam_title: 'Modellsatz 1',
      test_type: 'lesen',
      score: 12,
      total_questions: 15,
      percentage: 80,
      passed: true,
      time_spent_seconds: 600,
      answers: { q1: 'a' },
      results: { score: 12 }
    });

    assert.ok(attempt1.id);
    assert.equal(attempt1.exam_id, 'modellsatz-1');

    const attempt2 = await memoryStorage.saveAttempt({
      exam_id: 'modellsatz-2',
      exam_title: 'Modellsatz 2',
      test_type: 'lesen',
      score: 8,
      total_questions: 15,
      percentage: 53.3,
      passed: false,
      time_spent_seconds: 900,
      answers: { q1: 'b' },
      results: { score: 8 }
    });

    const all = await memoryStorage.getAttempts();
    assert.equal(all.length, 2);
    assert.equal(all[0].id, attempt2.id, 'Newer attempt should come first');

    const counts = await memoryStorage.getExamAttemptCounts('lesen');
    assert.equal(counts['modellsatz-1'], 1);
    assert.equal(counts['modellsatz-2'], 1);
    assert.equal(counts['modellsatz-3'] || 0, 0);

    const last = await memoryStorage.getLastAttempt('lesen');
    assert.equal(last.id, attempt2.id);

    const fetched = await memoryStorage.getAttemptById(attempt1.id);
    assert.equal(fetched.score, 12);
  });

  it('filters attempts by test_type and supports deletion and clear', async () => {
    await memoryStorage.saveAttempt({
      id: 'att-lesen',
      exam_id: 'modellsatz-1',
      test_type: 'lesen',
      score: 10,
      total_questions: 15,
      percentage: 66,
      passed: true,
    });

    await memoryStorage.saveAttempt({
      id: 'att-schreiben',
      exam_id: 'schreiben-1',
      test_type: 'schreiben',
      score: 15,
      total_questions: 15,
      percentage: 100,
      passed: true,
    });

    const lesenOnly = await memoryStorage.getAttempts({ testType: 'lesen' });
    assert.equal(lesenOnly.length, 1);
    assert.equal(lesenOnly[0].id, 'att-lesen');

    const schreibenOnly = await memoryStorage.getAttempts({ testType: 'schreiben' });
    assert.equal(schreibenOnly.length, 1);
    assert.equal(schreibenOnly[0].id, 'att-schreiben');

    const deleted = await memoryStorage.deleteAttempt('att-lesen');
    assert.equal(deleted, true);
    assert.equal((await memoryStorage.getAttempts()).length, 1);

    await memoryStorage.clearAttempts();
    assert.equal((await memoryStorage.getAttempts()).length, 0);
  });

  it('LocalStorageAttemptStorage handles mocked window.localStorage gracefully', async () => {
    const mockStore = {};
    global.window = {
      localStorage: {
        getItem: (k) => mockStore[k] || null,
        setItem: (k, v) => { mockStore[k] = String(v); },
        removeItem: (k) => { delete mockStore[k]; },
      }
    };

    const localStore = new LocalStorageAttemptStorage('test_key');
    const saved = await localStore.saveAttempt({
      exam_id: 'modellsatz-3',
      score: 14,
      total_questions: 15,
      percentage: 93.3,
      passed: true,
    });

    assert.ok(mockStore['test_key']);
    const list = await localStore.getAttempts();
    assert.equal(list.length, 1);
    assert.equal(list[0].id, saved.id);

    await localStore.clearAttempts();
    assert.equal((await localStore.getAttempts()).length, 0);

    delete global.window;
  });

  it('client-side getNextBalancedExam balances selection using storage counts', async () => {
    const sampleExams = [
      { id: 'modellsatz-1', title: 'Exam 1' },
      { id: 'modellsatz-2', title: 'Exam 2' },
      { id: 'modellsatz-3', title: 'Exam 3' },
    ];

    await memoryStorage.saveAttempt({ exam_id: 'modellsatz-1', test_type: 'lesen' });
    await memoryStorage.saveAttempt({ exam_id: 'modellsatz-2', test_type: 'lesen' });

    const selected = await getNextBalancedExam({
      exams: sampleExams,
      storage: memoryStorage,
      testType: 'lesen'
    });

    assert.equal(selected.id, 'modellsatz-3', 'Should choose modellsatz-3 which has 0 attempts');
  });
});
