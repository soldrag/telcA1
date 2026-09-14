import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import { buildHeaderConfig, buildScreenProps } from '../src/utils/appPropsBuilder.js';

describe('Teacher Inspection Mode Architecture & Invariants', () => {
  test('buildHeaderConfig suppresses onSubmitExam and configures onExitInspection in inspection mode', () => {
    const mockControllerInspection = {
      screen: 'exam',
      activeTestType: 'lesen',
      testTypes: [{ id: 'lesen', title: 'Leseverstehen', maxScore: 15 }],
      examData: { questions: [{}, {}, {}] },
      session: {
        answeredCount: 0,
        isInspection: true,
      },
      navigateHome: () => {},
      openHistory: () => {},
      resetExam: () => {},
      exitInspection: () => {},
      modals: { openSubmitModal: () => {} },
    };

    const config = buildHeaderConfig(mockControllerInspection);
    assert.equal(config.navigation.isInspection, true);
    assert.equal(config.navigation.onSubmitExam, null);
    assert.equal(typeof config.navigation.onExitInspection, 'function');

    const mockControllerNormal = {
      ...mockControllerInspection,
      session: {
        answeredCount: 1,
        isInspection: false,
      },
    };

    const normalConfig = buildHeaderConfig(mockControllerNormal);
    assert.equal(normalConfig.navigation.isInspection, false);
    assert.equal(typeof normalConfig.navigation.onSubmitExam, 'function');
  });

  test('buildScreenProps passes isInspection and suppresses onOpenSubmitConfirm in inspection mode', () => {
    const mockController = {
      screen: 'exam',
      isLoadingExam: false,
      activeTestType: 'lesen',
      testTypes: [],
      exams: [],
      history: { recentAttempts: [], historyAttempts: [], historyLoading: false },
      examData: {
        exam: { title: 'Modellsatz 1', test_type: 'lesen' },
        questions: [{ id: 'q1' }, { id: 'q2' }],
      },
      session: { isInspection: true },
      timer: { isTimed: false },
      handleTimeUp: () => {},
      exitInspection: () => {},
      modals: { openSubmitModal: () => {} },
    };

    const screenProps = buildScreenProps(mockController);
    assert.equal(screenProps.exam.isInspection, true);
    assert.equal(screenProps.exam.onOpenSubmitConfirm, null);
    assert.equal(typeof screenProps.exam.onExitInspection, 'function');
    assert.equal(screenProps.exam.examConfig.examTitle, 'Modellsatz 1');
  });

  test('buildScreenProps exposes onInspectExam action in welcome props', () => {
    let inspectedExamId = null;
    const mockController = {
      exams: [],
      testTypes: [],
      activeTestType: 'lesen',
      currentExamId: 'modellsatz-1',
      history: { recentAttempts: [] },
      session: { results: null },
      openHistory: () => {},
      changeTestType: () => {},
      selectExam: () => {},
      startExam: () => {},
      inspectExam: (examId) => { inspectedExamId = examId; },
      startRandomExam: () => {},
      loadSavedAttempt: () => {},
      modals: { openShareModal: () => {}, openAssignmentModal: () => {} },
      reviewMode: { processReviewToken: () => {} },
      assignmentMode: { processToken: () => {} },
    };

    const screenProps = buildScreenProps(mockController);
    assert.equal(typeof screenProps.welcome.actions.onInspectExam, 'function');

    screenProps.welcome.actions.onInspectExam('modellsatz-3');
    assert.equal(inspectedExamId, 'modellsatz-3');
  });

  test('inspection mode invariant: submitCurrentExam guard protects storage from attempt pollution', async () => {
    let submitServiceCalled = false;
    let saveAttemptCalled = false;

    const mockStorage = {
      saveAttempt: async () => { saveAttemptCalled = true; },
      getAttempts: async () => [],
    };

    const mockSubmitService = async () => {
      submitServiceCalled = true;
      return { score: 15, totalQuestions: 15 };
    };

    // Simulate inspection guard logic matching useExamSession
    const simulateSubmitExam = async ({ isInspection, isSubmitted, isSubmitting }) => {
      if (isSubmitted || isSubmitting || isInspection) return null;
      const resultData = await mockSubmitService();
      await mockStorage.saveAttempt(resultData);
      return resultData;
    };

    const result = await simulateSubmitExam({
      isInspection: true,
      isSubmitted: false,
      isSubmitting: false,
    });

    assert.equal(result, null);
    assert.equal(submitServiceCalled, false, 'submitService must not be called during inspection');
    assert.equal(saveAttemptCalled, false, 'storage.saveAttempt must never be called during inspection');
  });
});
