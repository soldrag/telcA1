import { useCallback, useEffect } from 'react';
import { getNextBalancedExam } from '../utils/examBalancer.js';

function getExamDurationSeconds(details) {
  return (details?.exam?.time_limit_minutes || 25) * 60;
}

export function useExamFlowActions({
  screen,
  loader,
  session,
  timer,
  modals,
  history,
  storage,
  assignmentMode,
  reviewMode,
  navigateTo,
  showError,
}) {
  const startExam = useCallback(async ({ timed = true, specificExamId } = {}) => {
    session.resetSession();
    const targetId = specificExamId || loader.currentExamId;
    let targetExamData = loader.examData;

    if (targetId !== loader.currentExamId || !targetExamData || targetExamData.exam?.id !== targetId) {
      targetExamData = await loader.loadExamById(targetId);
      loader.selectExam(targetId);
    }

    timer.resetTimer(timed, getExamDurationSeconds(targetExamData));
    navigateTo('exam');
  }, [loader, session, timer, navigateTo]);

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
    const submitResult = await session.submitCurrentExam({
      examId: loader.currentExamId,
      isTimed: timer.isTimed,
      secondsLeft: timer.secondsLeft,
      secondsElapsed: timer.secondsElapsed,
      totalSeconds: timer.totalSeconds,
    });
    modals.closeSubmitModal();
    modals.closeTimeUpModal();

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
  }, [session, loader.currentExamId, timer, modals, assignmentMode, history, navigateTo]);

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
    if (assignmentMode?.isAssignmentMode) {
      assignmentMode.exitAssignment();
      return;
    }
    if (reviewMode?.isTeacherReview) {
      reviewMode.exitReview();
      return;
    }
    session.resetSession();
    navigateTo('welcome');
  }, [session, modals, assignmentMode, reviewMode, navigateTo]);

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

    if (assignmentMode?.isAssignmentMode) {
      assignmentMode.exitAssignment();
      return;
    }

    if (reviewMode?.isTeacherReview) {
      reviewMode.exitReview();
      return;
    }

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
    navigateHome,
    resetExam,
  };
}
