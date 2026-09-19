import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { buildScreenProps } from '../src/utils/appPropsBuilder.js';
import { useExamFlowActions } from '../src/hooks/useExamFlowActions.js';

function setupReactDispatcher() {
  React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher.current = {
    useState: (initial) => [typeof initial === 'function' ? initial() : initial, () => {}],
    useCallback: (fn) => fn,
    useEffect: () => {},
    useRef: (val) => ({ current: val }),
  };
}

describe('Assignment Results Flow & Presentation DTO Contracts', () => {
  setupReactDispatcher();
  it('suppresses assignmentSubmission in results props for regular exam sessions', () => {
    const mockController = {
      screen: 'results',
      exams: [],
      testTypes: [],
      activeTestType: 'lesen',
      currentExamId: 'modellsatz-1',
      examData: { exam: { id: 'modellsatz-1', test_type: 'lesen' }, questions: [] },
      isLoadingExam: false,
      session: {
        answers: { 'q1': 'a' },
        results: { score: 12, totalQuestions: 15 },
        answeredCount: 1,
        isSubmitted: true,
      },
      timer: { isTimed: true, totalSeconds: 1500, secondsLeft: 200, secondsElapsed: 1300 },
      history: { recentAttempts: [], historyAttempts: [], refreshAttempts: async () => {}, refreshHistory: async () => {} },
      reviewMode: { isTeacherReview: false },
      assignmentMode: { isAssignmentMode: false, assignmentData: null, lockoutState: null },
      modals: { closeSubmitModal: () => {}, closeTimeUpModal: () => {} },
      navigateTo: () => {},
    };

    const screenProps = buildScreenProps(mockController);
    assert.equal(screenProps.results.assignmentSubmission, null);
    assert.equal(screenProps.results.isTeacherReview, false);
  });

  it('delivers complete assignmentSubmission with teacher shareUrl to results props upon assignment completion', () => {
    const mockAssignmentData = {
      assignmentId: 'asg-flow-test-123',
      examId: 'modellsatz-2',
      testType: 'lesen',
      studentName: 'Maria Schmidt',
      timeLimitSeconds: 1500,
    };
    const mockLockoutState = {
      status: 'submitted',
      submittedAt: '2026-09-19T12:00:00Z',
      shareUrl: 'http://localhost:5173/#review=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test',
      telemetry: { wallClockSeconds: 450, tabSwitches: 0 },
    };

    let exitCalled = false;
    const mockAssignmentMode = {
      isAssignmentMode: true,
      assignmentData: mockAssignmentData,
      lockoutState: mockLockoutState,
      exitAssignment: () => {
        exitCalled = true;
      },
    };

    const mockController = {
      screen: 'results',
      exams: [],
      testTypes: [],
      activeTestType: 'lesen',
      currentExamId: 'modellsatz-2',
      examData: { exam: { id: 'modellsatz-2', test_type: 'lesen' }, questions: [] },
      isLoadingExam: false,
      session: {
        answers: {},
        results: { score: 14, totalQuestions: 15 },
        answeredCount: 15,
        isSubmitted: true,
      },
      timer: { isTimed: true, totalSeconds: 1500, secondsLeft: 1050, secondsElapsed: 450 },
      history: { recentAttempts: [], historyAttempts: [] },
      reviewMode: { isTeacherReview: false },
      assignmentMode: mockAssignmentMode,
      modals: {},
      navigateTo: () => {},
    };

    const screenProps = buildScreenProps(mockController);
    const sub = screenProps.results.assignmentSubmission;

    assert.ok(sub, 'assignmentSubmission must be defined');
    assert.equal(sub.isAssignment, true);
    assert.equal(sub.assignmentData.studentName, 'Maria Schmidt');
    assert.equal(sub.lockoutState.status, 'submitted');
    assert.equal(sub.lockoutState.shareUrl, mockLockoutState.shareUrl);

    sub.onExitAssignment();
    assert.equal(exitCalled, true, 'onExitAssignment must trigger exit callback');
  });

  it('submitExam calls finalizeAssignment and transitions directly to results screen', async () => {
    let finalizedAttempt = null;
    let navigatedScreen = null;
    let submitModalClosed = false;

    const mockSession = {
      answers: { 'q1': 'b' },
      submitCurrentExam: async () => ({ score: 10, totalQuestions: 15 }),
      results: { score: 10, totalQuestions: 15 },
    };
    const mockTimer = {
      isTimed: true,
      secondsElapsed: 320,
      secondsLeft: 1180,
      totalSeconds: 1500,
      registerTimeUpHandler: () => {},
    };
    const mockModals = {
      closeSubmitModal: () => { submitModalClosed = true; },
      closeTimeUpModal: () => {},
    };
    const mockAssignmentMode = {
      isAssignmentMode: true,
      finalizeAssignment: async (payload) => {
        finalizedAttempt = payload;
        return 'http://localhost:5173/#review=token123';
      },
    };
    const mockHistory = {
      refreshAttempts: async () => {},
      refreshHistory: async () => {},
    };

    const actions = useExamFlowActions({
      screen: 'exam',
      loader: { currentExamId: 'modellsatz-1' },
      session: mockSession,
      timer: mockTimer,
      modals: mockModals,
      history: mockHistory,
      storage: {},
      assignmentMode: mockAssignmentMode,
      navigateTo: (screen) => { navigatedScreen = screen; },
      showError: () => {},
    });

    await actions.submitExam();

    assert.equal(submitModalClosed, true, 'submit modal must be closed');
    assert.ok(finalizedAttempt, 'finalizeAssignment must be invoked with attempt data');
    assert.equal(finalizedAttempt.score, 10);
    assert.equal(finalizedAttempt.timeSpentSeconds, 320);
    assert.equal(navigatedScreen, 'results', 'must navigate directly to results screen');
  });
});
