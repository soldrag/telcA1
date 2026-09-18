import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import { calculateAssignmentTimerState } from '../src/services/assignment/assignmentTimerService.js';

describe('Assignment Timer Domain Service', () => {
  test('returns untimed state when timeLimitSeconds is 0', () => {
    const result = calculateAssignmentTimerState({ timeLimitSeconds: 0 });
    assert.deepEqual(result, {
      isTimed: false,
      totalSeconds: 0,
      remainingSeconds: 0,
      elapsedSeconds: 0,
      isExpired: false,
    });
  });

  test('calculates fresh timer state for new assignment without startedAt', () => {
    const result = calculateAssignmentTimerState({ timeLimitSeconds: 1500 });
    assert.deepEqual(result, {
      isTimed: true,
      totalSeconds: 1500,
      remainingSeconds: 1500,
      elapsedSeconds: 0,
      isExpired: false,
    });
  });

  test('calculates remaining time accurately when resumed midway', () => {
    const now = 1700000000000;
    const startedAt = new Date(now - 300 * 1000).toISOString(); // 300 seconds (5 min) ago

    const result = calculateAssignmentTimerState({
      timeLimitSeconds: 1500,
      startedAt,
      now,
    });

    assert.equal(result.isTimed, true);
    assert.equal(result.totalSeconds, 1500);
    assert.equal(result.elapsedSeconds, 300);
    assert.equal(result.remainingSeconds, 1200);
    assert.equal(result.isExpired, false);
  });

  test('detects expired time when elapsed exceeds time limit', () => {
    const now = 1700000000000;
    const startedAt = new Date(now - 1600 * 1000).toISOString(); // 1600 seconds ago (> 1500)

    const result = calculateAssignmentTimerState({
      timeLimitSeconds: 1500,
      startedAt,
      now,
    });

    assert.equal(result.isTimed, true);
    assert.equal(result.totalSeconds, 1500);
    assert.equal(result.elapsedSeconds, 1600);
    assert.equal(result.remainingSeconds, 0);
    assert.equal(result.isExpired, true);
  });
});
