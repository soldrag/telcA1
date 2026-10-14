import { useCallback, useEffect } from 'react';
import { getNextBalancedExam } from '../utils/examBalancer.js';
import { getTestTypeById } from '../../shared/testTypes.js';
import { resolveDraftTimer } from '../utils/examDraft.js';

// Callers that keep no draft (tests, embeds) leave the draft port out.
const NO_DRAFT = { pending: null, clear() {} };

function getExamDurationSeconds(details) {
  const exam = details?.exam || {};
  const minutes = exam.time_limit_minutes || getTestTypeById(exam.test_type || 'lesen').timeLimitMinutes;
  return minutes * 60;
}

function tryExitSpecialMode(assignmentMode, reviewMode) {
  if (assignmentMode?.isAssignmentMode) {
    assignmentMode.exitAssignment();
    return true;
  }
  if (reviewMode?.isTeacherReview) {
    reviewMode.exitReview();
    return true;
  }
  return false;
}

export function useExamFlowActions({
  screen,
  loader,
  session,
  timer,
  modals,
  history,
  storage,
  examDraft = NO_DRAFT,
  assignmentMode,
  reviewMode,
  navigateTo,
  showError,
}) {
  const startExam = useCallback(async ({ timed = true, specificExamId } = {}) => {
    const targetId = specificExamId || loader.currentExamId;
    // Before the module's variants load there is nothing to start; a guessed id could open another module's exam.
    if (!targetId) return;
    session.resetSession();
    examDraft.clear();
    let targetExamData = loader.examData;

    if (targetId !== loader.currentExamId || !targetExamData || targetExamData.exam?.id !== targetId) {
      targetExamData = await loader.loadExamById(targetId);
      loader.selectExam(targetId);
    }

    timer.resetTimer(timed, getExamDurationSeconds(targetExamData));
    navigateTo('exam');
  }, [loader, session, timer, examDraft, navigateTo]);

  const startRandomExam = useCallback(async ({ timed = true } = {}) => {
    try {
      const selected = await getNextBalancedExam({
        exams: loader.exams,
        storage,
        testType: loader.activeTestType,
      });
      await startExam({ timed, specificExamId: selected?.id });
    } catch (balancerError) {
      console.warn('[useExamFlowActions] Balancer fallback:', balancerError);
      await startExam({ timed });
    }
  }, [loader.exams, loader.activeTestType, storage, startExam]);

  const submitExam = useCallback(async () => {
    let submitResult;
    try {
      // The student answered the questions on screen: grade that exam even if the selection moved meanwhile.
      submitResult = await session.submitCurrentExam({
        examId: loader.examData?.exam?.id || loader.currentExamId,
        isTimed: timer.isTimed,
        secondsLeft: timer.secondsLeft,
        secondsElapsed: timer.secondsElapsed,
        totalSeconds: timer.totalSeconds,
      });
    } catch (error) {
      // A grading failure must be visible: the dialog closes over the error banner, the answers stay in the exam.
      console.error('Exam submission failed:', error);
      modals.closeSubmitModal();
      modals.closeTimeUpModal();
      showError('errors.submitExam');
      return;
    }
    // The time-up dialog stays over the results until the student closes it; otherwise it only flashes.
    modals.closeSubmitModal();
    examDraft.clear();

    if (assignmentMode?.isAssignmentMode) {
      await assignmentMode.finalizeAssignment({
        answers: session.answers,
        timeSpentSeconds: timer.secondsElapsed,
        score: submitResult?.score,
        totalQuestions: submitResult?.totalQuestions,
      });
    }

    await history.refreshAttempts();
    await history.refreshHistory();
    navigateTo('results');
  }, [session, loader.examData, loader.currentExamId, timer, modals, examDraft, assignmentMode, history, navigateTo, showError]);

  const handleTimeUp = useCallback(() => {
    if (session.isSubmitted || screen !== 'exam') return;
    modals.openTimeUpModal();
    submitExam();
  }, [session.isSubmitted, screen, modals, submitExam]);

  useEffect(() => {
    timer.registerTimeUpHandler(handleTimeUp);
  }, [timer, handleTimeUp]);

  const loadSavedAttempt = useCallback(async (attemptId) => {
    try {
      const data = await storage.getAttemptById(attemptId);
      if (!data?.results) return;
      if (data.exam_id && (!loader.examData || loader.examData.exam?.id !== data.exam_id)) {
        await loader.loadExamById(data.exam_id);
      }
      loader.selectExam(data.exam_id);
      session.loadPastAttempt(data);
      navigateTo('results');
    } catch {
      showError('errors.loadSavedAttempt');
    }
  }, [storage, loader, session, navigateTo, showError]);

  const openHistory = useCallback(() => {
    history.refreshHistory();
    navigateTo('history');
  }, [history, navigateTo]);

  const retakeMistakes = useCallback(() => {
    session.retakeMistakes();
    navigateTo('exam');
  }, [session, navigateTo]);

  const leaveExam = useCallback(() => {
    modals.closeLeaveModal();
    examDraft.clear();
    if (tryExitSpecialMode(assignmentMode, reviewMode)) return;
    session.resetSession();
    navigateTo('welcome');
  }, [session, modals, examDraft, assignmentMode, reviewMode, navigateTo]);

  const resumeDraft = useCallback(async () => {
    const draft = examDraft.pending;
    if (!draft) return;
    const data = await loader.loadExamById(draft.examId);
    if (!data?.exam) {
      examDraft.clear();
      return;
    }
    if (data.exam.test_type) loader.changeTestType(data.exam.test_type);
    loader.selectExam(draft.examId);
    session.restoreSession(draft);
    const { isTimed, totalSeconds, secondsLeft } = resolveDraftTimer(draft);
    timer.resetTimer(isTimed, totalSeconds, secondsLeft);
    examDraft.clear();
    navigateTo('exam');
  }, [examDraft, loader, session, timer, navigateTo]);

  const inspectExam = useCallback(async (examId) => {
    session.resetSession();
    session.setIsInspection?.(true);
    const targetId = examId || loader.currentExamId;
    loader.selectExam(targetId);
    if (!loader.examData || loader.examData.exam?.id !== targetId) {
      await loader.loadExamById(targetId);
    }
    timer.resetTimer(false, 0);
    navigateTo('exam');
  }, [loader, session, timer, navigateTo]);

  const exitInspection = useCallback(() => {
    session.resetSession();
    navigateTo('welcome');
  }, [session, navigateTo]);

  const navigateHome = useCallback(() => {
    if (screen === 'exam' && !session.isSubmitted && session.answeredCount > 0 && !session.isInspection) {
      modals.openLeaveModal();
      return;
    }

    if (tryExitSpecialMode(assignmentMode, reviewMode)) return;

    if (session.isInspection || session.isSubmitted) {
      session.resetSession();
    }
    navigateTo('welcome');
  }, [screen, session, modals, assignmentMode, reviewMode, navigateTo]);

  const resetExam = useCallback(() => {
    startExam({ timed: timer.isTimed });
  }, [startExam, timer.isTimed]);

  return {
    startExam,
    startRandomExam,
    inspectExam,
    exitInspection,
    submitExam,
    handleTimeUp,
    loadSavedAttempt,
    openHistory,
    retakeMistakes,
    leaveExam,
    resumeDraft,
    navigateHome,
    resetExam,
  };
}
