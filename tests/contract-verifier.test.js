import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  timerContract,
  sessionContract,
  loaderContract,
  assignmentContract,
  screenContracts,
} from '../src/contracts/index.js';

describe('Architectural Contract Specifications', () => {
  test('timerContract specifies all required methods and properties', () => {
    assert.ok(timerContract.requiredMethods.includes('resetTimer'));
    assert.ok(timerContract.requiredMethods.includes('togglePause'));
    assert.ok(timerContract.requiredMethods.includes('pauseTimer'));
    assert.ok(timerContract.requiredMethods.includes('resumeTimer'));
    assert.ok(timerContract.requiredMethods.includes('startTimer'));
    assert.ok(timerContract.requiredProperties.includes('isTimed'));
    assert.ok(timerContract.requiredProperties.includes('secondsLeft'));
    assert.ok(timerContract.requiredProperties.includes('isPaused'));
  });

  test('assignmentContract specifies all lifecycle methods', () => {
    assert.ok(assignmentContract.requiredMethods.includes('startAssignment'));
    assert.ok(assignmentContract.requiredMethods.includes('finalizeAssignment'));
    assert.ok(assignmentContract.requiredMethods.includes('exitAssignment'));
    assert.ok(assignmentContract.requiredMethods.includes('processToken'));
    assert.ok(assignmentContract.requiredProperties.includes('isAssignmentMode'));
  });

  test('screenContracts covers all application screens', () => {
    assert.ok('assignment' in screenContracts);
    assert.ok('welcome' in screenContracts);
    assert.ok('exam' in screenContracts);
    assert.ok('results' in screenContracts);
    assert.ok('history' in screenContracts);
  });
});
