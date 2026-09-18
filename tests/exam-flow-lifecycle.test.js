import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { useExamFlowActions } from '../src/hooks/useExamFlowActions.js';
import { useExamSession } from '../src/hooks/useExamSession.js';

function createHookHarness(hookFn) {
  let stateSlots = [];
  let slotIndex = 0;
  let currentInstance = null;
  let lastArgs = [];

  const dispatcher = {
    useState: (initial) => {
      const idx = slotIndex++;
      if (stateSlots[idx] === undefined) {
        stateSlots[idx] = typeof initial === 'function' ? initial() : initial;
      }
      const setState = (action) => {
        stateSlots[idx] = typeof action === 'function' ? action(stateSlots[idx]) : action;
        run(...lastArgs);
      };
      return [stateSlots[idx], setState];
    },
    useCallback: (fn) => fn,
    useEffect: () => {},
    useRef: (val) => ({ current: val }),
  };

  function run(...args) {
    lastArgs = args;
    slotIndex = 0;
    React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher.current = dispatcher;
    currentInstance = hookFn(...args);
    return currentInstance;
  }

  return { run, get: () => currentInstance };
}

describe('Exam Flow Lifecycle & Session Invariants', () => {
  test('useExamSession: retakeMistakes resets activeTeil to 1 and activeQuestionIndex to 0', () => {
    const harness = createHookHarness(useExamSession);
    const session = harness.run();

    session.selectTeil(3);
    session.jumpToQuestion(14, 'q14');
    assert.equal(harness.get().activeTeil, 3);
    assert.equal(harness.get().activeQuestionIndex, 14);

    harness.get().loadPastAttempt({
      answers: { q1: 'correct', q2: 'wrong' },
      results: {
        reviewItems: [
          { id: 'q1', is_correct: true },
          { id: 'q2', is_correct: false },
        ],
      },
    });

    harness.get().retakeMistakes();
    const updated = harness.get();

    assert.equal(updated.activeTeil, 1, 'activeTeil must reset to 1 on retake');
    assert.equal(updated.activeQuestionIndex, 0, 'activeQuestionIndex must reset to 0 on retake');
    assert.equal(updated.isSubmitted, false, 'isSubmitted must be false');
    assert.equal(updated.results, null, 'results must be null');
    assert.deepEqual(updated.answers, { q1: 'correct' }, 'only correct answers must be preserved');
  });

  test('startExam unconditionally resets session when restarting the same exam', async () => {
    let sessionResetCalled = false;
    let navigatedScreen = null;
    let timerDuration = null;

    React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher.current = {
      useCallback: (fn) => fn,
      useEffect: () => {},
      useRef: (v) => ({ current: v }),
    };

    const actions = useExamFlowActions({
      screen: 'welcome',
      loader: {
        currentExamId: 'modellsatz-1',
        examData: { exam: { id: 'modellsatz-1', time_limit_minutes: 25 } },
        loadExamById: async () => ({ exam: { id: 'modellsatz-1' } }),
        selectExam: () => {},
      },
      session: { resetSession: () => { sessionResetCalled = true; } },
      timer: { resetTimer: (timed, dur) => { timerDuration = dur; } },
      modals: {},
      navigateTo: (s) => { navigatedScreen = s; },
    });

    await actions.startExam();

    assert.equal(sessionResetCalled, true, 'session.resetSession must be called');
    assert.equal(navigatedScreen, 'exam', 'must navigate to exam');
    assert.equal(timerDuration, 1500, 'timer duration must match 25 min');
  });

  test('startExam unconditionally resets session when starting a different exam', async () => {
    let sessionResetCalled = false;
    let selectedExamId = null;
    let loadedExamId = null;
    let navigatedScreen = null;

    React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher.current = {
      useCallback: (fn) => fn,
      useEffect: () => {},
      useRef: (v) => ({ current: v }),
    };

    const actions = useExamFlowActions({
      screen: 'welcome',
      loader: {
        currentExamId: 'modellsatz-1',
        examData: { exam: { id: 'modellsatz-1' } },
        loadExamById: async (id) => { loadedExamId = id; return { exam: { id, time_limit_minutes: 20 } }; },
        selectExam: (id) => { selectedExamId = id; },
      },
      session: { resetSession: () => { sessionResetCalled = true; } },
      timer: { resetTimer: () => {} },
      modals: {},
      navigateTo: (s) => { navigatedScreen = s; },
    });

    await actions.startExam({ specificExamId: 'modellsatz-2' });

    assert.equal(sessionResetCalled, true, 'session.resetSession must be called for different exam ID');
    assert.equal(loadedExamId, 'modellsatz-2', 'must load new exam details');
    assert.equal(selectedExamId, 'modellsatz-2', 'must select new exam ID');
    assert.equal(navigatedScreen, 'exam', 'must navigate to exam');
  });

  test('startRandomExam resets session and delegates cleanly on balancer success', async () => {
    let sessionResetCount = 0;
    let loadedExamId = null;
    let navigatedScreen = null;

    React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher.current = {
      useCallback: (fn) => fn,
      useEffect: () => {},
      useRef: (v) => ({ current: v }),
    };

    const actions = useExamFlowActions({
      screen: 'welcome',
      loader: {
        exams: [{ id: 'modellsatz-2' }],
        activeTestType: 'lesen',
        currentExamId: 'modellsatz-1',
        examData: { exam: { id: 'modellsatz-1', time_limit_minutes: 25 } },
        loadExamById: async (id) => { loadedExamId = id; return { exam: { id, time_limit_minutes: 25 } }; },
        selectExam: () => {},
      },
      storage: {
        getExamAttemptCounts: async () => ({}),
        getLastAttempt: async () => null,
      },
      session: { resetSession: () => { sessionResetCount++; } },
      timer: { resetTimer: () => {} },
      modals: {},
      navigateTo: (s) => { navigatedScreen = s; },
    });

    await actions.startRandomExam();

    assert.equal(sessionResetCount, 1, 'startRandomExam must trigger session.resetSession');
    assert.equal(loadedExamId, 'modellsatz-2', 'startRandomExam must load the balanced exam ID');
    assert.equal(navigatedScreen, 'exam', 'must navigate to exam');
  });

  test('startRandomExam falls back to startExam and resets session on balancer error', async () => {
    let sessionResetCount = 0;
    let navigatedScreen = null;

    React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher.current = {
      useCallback: (fn) => fn,
      useEffect: () => {},
      useRef: (v) => ({ current: v }),
    };

    const actions = useExamFlowActions({
      screen: 'welcome',
      loader: {
        exams: [{ id: 'modellsatz-1' }],
        activeTestType: 'lesen',
        currentExamId: 'modellsatz-1',
        examData: { exam: { id: 'modellsatz-1', time_limit_minutes: 25 } },
        loadExamById: async (id) => ({ exam: { id, time_limit_minutes: 25 } }),
        selectExam: () => {},
      },
      storage: {
        getExamAttemptCounts: async () => { throw new Error('Storage failure'); },
        getLastAttempt: async () => null,
      },
      session: { resetSession: () => { sessionResetCount++; } },
      timer: { resetTimer: () => {} },
      modals: {},
      navigateTo: (s) => { navigatedScreen = s; },
    });

    await actions.startRandomExam();

    assert.equal(sessionResetCount, 1, 'startRandomExam fallback must trigger session.resetSession');
    assert.equal(navigatedScreen, 'exam', 'must navigate to exam');
  });

  test('leaveExam cleanly resets session when abandoning an exam', () => {
    let sessionResetCalled = false;
    let modalClosed = false;
    let navigatedScreen = null;

    React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher.current = {
      useCallback: (fn) => fn,
      useEffect: () => {},
      useRef: (v) => ({ current: v }),
    };

    const actions = useExamFlowActions({
      screen: 'exam',
      loader: {},
      session: { resetSession: () => { sessionResetCalled = true; } },
      timer: {},
      modals: { closeLeaveModal: () => { modalClosed = true; } },
      navigateTo: (s) => { navigatedScreen = s; },
    });

    actions.leaveExam();

    assert.equal(sessionResetCalled, true, 'leaveExam must reset session');
    assert.equal(modalClosed, true, 'leaveExam must close modal');
    assert.equal(navigatedScreen, 'welcome', 'leaveExam must navigate to welcome');
  });

  test('navigateHome resets session if returning from a submitted exam', () => {
    let sessionResetCalled = false;
    let navigatedScreen = null;

    React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher.current = {
      useCallback: (fn) => fn,
      useEffect: () => {},
      useRef: (v) => ({ current: v }),
    };

    const actions = useExamFlowActions({
      screen: 'results',
      loader: {},
      session: {
        isSubmitted: true,
        answeredCount: 15,
        isInspection: false,
        resetSession: () => { sessionResetCalled = true; },
      },
      timer: {},
      modals: { openLeaveModal: () => {} },
      navigateTo: (s) => { navigatedScreen = s; },
    });

    actions.navigateHome();

    assert.equal(sessionResetCalled, true, 'navigateHome must reset completed session');
    assert.equal(navigatedScreen, 'welcome', 'must navigate to welcome');
  });
});
