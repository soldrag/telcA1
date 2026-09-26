import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { summarizeVariantScores } from '../src/utils/attemptStats.js';
import {
  getReceivedAssignments,
  saveReceivedAssignment,
  recordReceivedAssignmentResult,
} from '../src/services/storage/receivedAssignmentsStorage.js';

describe('summarizeVariantScores', () => {
  const attempts = [
    { exam_id: 'e1', test_type: 'lesen', score: 6, total_questions: 15 },
    { exam_id: 'e1', test_type: 'lesen', score: 11, total_questions: 15 },
    { exam_id: 'e2', test_type: 'lesen', score: 4, total_questions: 15 },
    { exam_id: 's1', test_type: 'schreiben', score: 14, total_questions: 6 },
  ];

  it('keeps the best score per variant of the chosen module only', () => {
    const summary = summarizeVariantScores(attempts, 'lesen');
    assert.deepEqual(summary.bestByExamId, { e1: { score: 11, total: 15 }, e2: { score: 4, total: 15 } });
    assert.deepEqual(summary.best, { score: 11, total: 15 });
    assert.equal(summary.attemptsCount, 3);
  });

  it('scores Schreiben against 15 points, not its 6 tasks', () => {
    assert.deepEqual(summarizeVariantScores(attempts, 'schreiben').best, { score: 14, total: 15 });
  });

  it('returns no best score when the module has no attempts', () => {
    assert.equal(summarizeVariantScores(attempts, 'hoeren').best, null);
  });
});

describe('receivedAssignmentsStorage', () => {
  beforeEach(() => {
    const store = new Map();
    globalThis.localStorage = {
      getItem: (key) => (store.has(key) ? store.get(key) : null),
      setItem: (key, value) => store.set(key, String(value)),
    };
  });
  afterEach(() => { delete globalThis.localStorage; });

  const assignment = { assignmentId: 'asg_1', examId: 'e4', testType: 'lesen', note: 'bis Donnerstag', timeLimitSeconds: 1500 };

  it('keeps one entry per assignment and the original receive date', () => {
    saveReceivedAssignment(assignment, 'zt1.a');
    const firstReceivedAt = getReceivedAssignments()[0].receivedAt;
    saveReceivedAssignment(assignment, 'zt1.a');
    const list = getReceivedAssignments();
    assert.equal(list.length, 1);
    assert.equal(list[0].receivedAt, firstReceivedAt);
    assert.equal(list[0].token, 'zt1.a');
  });

  it('marks the assignment submitted with its score', () => {
    saveReceivedAssignment(assignment, 'zt1.a');
    recordReceivedAssignmentResult('asg_1', { score: 11 });
    const [entry] = getReceivedAssignments();
    assert.equal(entry.score, 11);
    assert.ok(entry.submittedAt);
  });
});
