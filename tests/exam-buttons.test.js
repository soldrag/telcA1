import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { useExamFlowActions } from '../src/hooks/useExamFlowActions.js';
import { useExamTimer } from '../src/hooks/useExamTimer.js';
import { useExamSession } from '../src/hooks/useExamSession.js';

function setupReactDispatcher() {
  React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher.current = {
    useState: (initial) => [typeof initial === 'function' ? initial() : initial, () => {}],
    useCallback: (fn) => fn,
    useEffect: () => {},
    useRef: (val) => ({ current: val }),
  };
}

describe('Exam & Results Button Actions', () => {
  setupReactDispatcher();

  test('timer button actions: togglePause, pauseTimer, resumeTimer, startTimer', () => {
    let isPausedState = false;

    React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher.current = {
      useState: (initial) => {
        if (typeof initial === 'boolean') {
          return [isPausedState, (v) => { isPausedState = typeof v === 'function' ? v(isPausedState) : v; }];
        }
        return [initial, () => {}];
      },
      useCallback: (fn) => fn,
      useEffect: () => {},
      useRef: (val) => ({ current: val }),
    };

    const timer = useExamTimer(1500);

    assert.equal(typeof timer.togglePause, 'function');
    assert.equal(typeof timer.pauseTimer, 'function');
    assert.equal(typeof timer.resumeTimer, 'function');
    assert.equal(typeof timer.startTimer, 'function');

    timer.pauseTimer();
    assert.equal(isPausedState, true, 'pauseTimer must pause');

    timer.resumeTimer();
    assert.equal(isPausedState, false, 'resumeTimer must resume');

    timer.startTimer();
    assert.equal(isPausedState, false, 'startTimer must ensure unpaused');
  });

  test('exam session button actions: selectAnswer, selectTeil, nextTeil, previousTeil', () => {
    let answersState = {};
    let activeTeilState = 1;

    React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher.current = {
      useState: (initial) => {
        if (typeof initial === 'number') {
          return [activeTeilState, (v) => { activeTeilState = typeof v === 'function' ? v(activeTeilState) : v; }];
        }
        if (typeof initial === 'object' && initial !== null) {
          return [answersState, (v) => { answersState = typeof v === 'function' ? v(answersState) : v; }];
        }
        return [initial, () => {}];
      },
      useCallback: (fn) => fn,
      useEffect: () => {},
      useRef: (val) => ({ current: val }),
    };

    const session = useExamSession();

    session.selectAnswer('q1', 'b');
    assert.equal(answersState.q1, 'b', 'selectAnswer must register answer');

    session.nextTeil(3);
    assert.equal(activeTeilState, 2, 'nextTeil must increment Teil');

    session.previousTeil();
    assert.equal(activeTeilState, 1, 'previousTeil must decrement Teil');
  });

  test('submitCurrentExam returns resultData for caller consumption', async () => {
    const mockResultData = {
      attemptId: 'att_123',
      score: 14,
      totalQuestions: 15,
      percentage: 93.3,
      passed: true,
    };

    setupReactDispatcher();

    const session = useExamSession({
      submitService: async () => mockResultData,
      storage: { saveAttempt: async () => {} },
    });

    const returned = await session.submitCurrentExam({
      examId: 'modellsatz-1',
      isTimed: true,
      secondsLeft: 300,
      secondsElapsed: 1200,
      totalSeconds: 1500,
    });

    assert.deepEqual(returned, mockResultData, 'submitCurrentExam must return resultData');
  });

  test('submitExam button action finalizes assignment and navigates to results', async () => {
    let finalizedPayload = null;
    let modalsClosed = false;
    let navigatedTo = null;

    setupReactDispatcher();

    const flow = useExamFlowActions({
      screen: 'exam',
      loader: { currentExamId: 'modellsatz-1' },
      session: {
        answers: { q1: 'a' },
        submitCurrentExam: async () => ({ score: 15, totalQuestions: 15 }),
      },
      timer: { isTimed: true, secondsLeft: 500, secondsElapsed: 1000, totalSeconds: 1500 },
      modals: {
        closeSubmitModal: () => { modalsClosed = true; },
        closeTimeUpModal: () => {},
      },
      history: {
        refreshAttempts: async () => {},
        refreshHistory: async () => {},
      },
      assignmentMode: {
        isAssignmentMode: true,
        finalizeAssignment: async (payload) => {
          finalizedPayload = payload;
        },
      },
      navigateTo: (dest) => { navigatedTo = dest; },
    });

    await flow.submitExam();

    assert.equal(modalsClosed, true, 'modals must close on submit');
    assert.equal(navigatedTo, 'results', 'must navigate to results');
    assert.equal(finalizedPayload?.score, 15, 'finalized assignment must receive score');
  });
});
