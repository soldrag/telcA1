import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { useAssignmentMode } from '../src/hooks/useAssignmentMode.js';

function setupReactDispatcher() {
  React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher.current = {
    useState: (initial) => [typeof initial === 'function' ? initial() : initial, () => {}],
    useCallback: (fn) => fn,
    useEffect: () => {},
    useRef: (val) => ({ current: val }),
  };
}

describe('Assignment Button Actions & Contract Invariants', () => {
  setupReactDispatcher();

  test('startAssignment button action transitions safely to exam without TypeError', async () => {
    let resetCalled = false;
    let timerResetArgs = null;
    let navigatedTo = null;

    const mockLoader = {
      examData: { exam: { id: 'asg-test-1', test_type: 'lesen' } },
      loadExamById: async (id) => ({ exam: { id } }),
      selectExam: () => {},
      changeTestType: () => {},
    };

    const mockSession = {
      resetSession: () => {
        resetCalled = true;
      },
    };

    const mockTimer = {
      resetTimer: (timed, dur, left) => {
        timerResetArgs = { timed, dur, left };
      },
      startTimer: () => {},
      pauseTimer: () => {},
    };

    const assignmentData = {
      assignmentId: 'asg_btn_test_1',
      examId: 'asg-test-1',
      testType: 'lesen',
      timeLimitSeconds: 1200,
      studentName: 'Student A',
    };

    React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher.current = {
      useState: (initial) => {
        if (initial === null) return [assignmentData, () => {}];
        return [initial, () => {}];
      },
      useCallback: (fn) => fn,
      useEffect: () => {},
      useRef: (val) => ({ current: val }),
    };

    const initializedHook = useAssignmentMode({
      loader: mockLoader,
      session: mockSession,
      timer: mockTimer,
      navigateTo: (dest) => {
        navigatedTo = dest;
      },
    });

    await assert.doesNotReject(async () => {
      await initializedHook.startAssignment();
    }, 'startAssignment must never throw TypeError');

    assert.equal(resetCalled, true, 'session must be reset on start');
    assert.deepEqual(
      timerResetArgs,
      { timed: true, dur: 1200, left: 1200 },
      'timer must receive correct timed and duration arguments'
    );
    assert.equal(navigatedTo, 'exam', 'must navigate to exam screen');
  });

  test('exitAssignment button action resets state and returns to welcome screen', () => {
    let resetCalled = false;
    let navigatedTo = null;

    setupReactDispatcher();

    const hook = useAssignmentMode({
      session: { resetSession: () => { resetCalled = true; } },
      navigateTo: (dest) => { navigatedTo = dest; },
    });

    hook.exitAssignment();

    assert.equal(resetCalled, true, 'session must reset on exit');
    assert.equal(navigatedTo, 'welcome', 'must navigate to welcome');
  });
});
