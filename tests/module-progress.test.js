import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { summarizeModuleProgress } from '../src/utils/moduleProgress.js';

const attempt = (id, created, score, breakdown, testType = 'lesen') => ({
  id, created_at: created, score, test_type: testType, results: { teilBreakdown: breakdown },
});

describe('summarizeModuleProgress', () => {
  it('is null without attempts of the module', () => {
    assert.equal(summarizeModuleProgress([attempt('s', '2026-09-01', 10, {}, 'schreiben')], 'lesen'), null);
  });

  it('averages each Teil over the last five attempts and flags the weakest', () => {
    const attempts = [
      attempt('a', '2026-09-01T10:00:00', 3, { 1: { score: 1, total: 5 }, 2: { score: 1, total: 5 }, 3: { score: 1, total: 5 } }),
      ...['b', 'c', 'd', 'e', 'f'].map((id, i) => attempt(id, `2026-09-0${i + 2}T10:00:00`, 11,
        { 1: { score: 5, total: 5 }, 2: { score: 2, total: 5 }, 3: { score: 4, total: 5 } })),
    ];
    const progress = summarizeModuleProgress(attempts, 'lesen');
    assert.equal(progress.window, 5);
    assert.deepEqual(progress.teils.map((entry) => entry.score), [5, 2, 4]);
    assert.equal(progress.weakest, 2);
  });

  it('flags no weakest Teil when all are equal', () => {
    const full = { 1: { score: 5, total: 5 }, 2: { score: 5, total: 5 }, 3: { score: 5, total: 5 } };
    assert.equal(summarizeModuleProgress([attempt('a', '2026-09-01', 15, full)], 'lesen').weakest, null);
  });

  it('keeps the trend oldest first on the module scale', () => {
    const attempts = [
      attempt('new', '2026-09-03', 12, { 1: { score: 5, total: 5 } }, 'schreiben'),
      attempt('old', '2026-09-01', 6.5, { 1: { score: 2, total: 5 } }, 'schreiben'),
    ];
    const progress = summarizeModuleProgress(attempts, 'schreiben');
    assert.deepEqual(progress.trend.map((point) => [point.id, point.score, point.max]), [['old', 6.5, 15], ['new', 12, 15]]);
    assert.equal(progress.passRatio, 9 / 15);
  });
});
