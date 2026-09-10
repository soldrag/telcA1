import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { 
  filterLeastAttemptedExams, 
  pickRandomExam, 
  selectBalancedRandomExam 
} from '../server/services/exam-balancer.js';

describe('Exam Balancer Service', () => {
  const sampleExams = [
    { id: 'modellsatz-1', title: 'Exam 1' },
    { id: 'modellsatz-2', title: 'Exam 2' },
    { id: 'modellsatz-3', title: 'Exam 3' },
  ];

  it('filters candidates with strictly minimum attempts', () => {
    const counts = {
      'modellsatz-1': 2,
      'modellsatz-2': 1,
      'modellsatz-3': 1,
    };

    const candidates = filterLeastAttemptedExams(sampleExams, counts);
    assert.equal(candidates.length, 2);
    assert.deepEqual(candidates.map(c => c.id).sort(), ['modellsatz-2', 'modellsatz-3']);
  });

  it('avoids repeating the immediately previous exam if alternatives exist', () => {
    const counts = {
      'modellsatz-1': 1,
      'modellsatz-2': 1,
      'modellsatz-3': 1,
    };

    const candidates = filterLeastAttemptedExams(sampleExams, counts, 'modellsatz-2');
    assert.equal(candidates.length, 2);
    assert.ok(!candidates.some(c => c.id === 'modellsatz-2'));
  });

  it('retains the single candidate even if it was the last exam', () => {
    const singleExam = [{ id: 'modellsatz-1', title: 'Exam 1' }];
    const candidates = filterLeastAttemptedExams(singleExam, {}, 'modellsatz-1');
    assert.equal(candidates.length, 1);
    assert.equal(candidates[0].id, 'modellsatz-1');
  });

  it('balances selection over multiple full cycles without starving any exam', () => {
    const counts = { 'modellsatz-1': 0, 'modellsatz-2': 0, 'modellsatz-3': 0 };
    let lastExamId = null;

    // Simulate 30 selections
    for (let round = 0; round < 30; round++) {
      const candidates = filterLeastAttemptedExams(sampleExams, counts, lastExamId);
      const chosen = pickRandomExam(candidates);
      assert.ok(chosen, 'Chosen exam must not be null');
      counts[chosen.id]++;
      lastExamId = chosen.id;
    }

    // Every exam should have been chosen exactly 10 times
    assert.equal(counts['modellsatz-1'], 10);
    assert.equal(counts['modellsatz-2'], 10);
    assert.equal(counts['modellsatz-3'], 10);
  });

  it('selectBalancedRandomExam integrates with SQLite database', () => {
    const memDb = new DatabaseSync(':memory:');
    memDb.exec(`
      CREATE TABLE exams (id TEXT PRIMARY KEY, test_type TEXT NOT NULL, sort_order INTEGER NOT NULL DEFAULT 1);
      CREATE TABLE attempts (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, exam_id TEXT NOT NULL, created_at TEXT NOT NULL);
      INSERT INTO exams VALUES ('modellsatz-1', 'lesen', 1), ('modellsatz-2', 'lesen', 2);
      INSERT INTO attempts VALUES ('att-1', 'u1', 'modellsatz-1', '2026-01-01');
    `);

    const result = selectBalancedRandomExam({ db: memDb, userId: 'u1', testType: 'lesen' });
    assert.equal(result.exam.id, 'modellsatz-2', 'Should pick modellsatz-2 which has 0 attempts');
    assert.equal(result.userAttemptsForExam, 0);
  });
});
