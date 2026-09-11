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
  navigateTo,
  showError,
}) {
  const startExam = useCallback(async ({ timed = true, specificExamId } = {}) => {
    const targetId = specificExamId || loader.currentExamId;
    if (targetId !== loader.currentExamId) {
      const data = await loader.loadExamById(targetId);
      loader.selectExam(targetId);
      timer.resetTimer(timed, getExamDurationSeconds(data));
    } else {
      session.resetSession();
      timer.resetTimer(timed, getExamDurationSeconds(loader.examData));
    }
    navigateTo('exam');
  }, [loader, session, timer, navigateTo]);

  const startRandomExam = useCallback(async ({ timed = true } = {}) => {
    try {
      const selected = await getNextBalancedExam({
        exams: loader.exams,
        storage,
        testType: loader.activeTestType,
      });
      if (selected?.id) {
        loader.selectExam(selected.id);
        const data = await loader.loadExamById(selected.id);
        timer.resetTimer(timed, getExamDurationSeconds(data));
      }
      navigateTo('exam');
    } catch (balancerError) {
      console.warn('[useExamFlowActions] Balancer fallback:', balancerError);
      startExam({ timed });
    }
  }, [loader, storage, timer, navigateTo, startExam]);

  const submitExam = useCallback(async () => {
    await session.submitCurrentExam({
      examId: loader.currentExamId,
      isTimed: timer.isTimed,
      secondsLeft: timer.secondsLeft,
      secondsElapsed: timer.secondsElapsed,
      totalSeconds: timer.totalSeconds,
    });
    modals.closeSubmitModal();
    modals.closeTimeUpModal();
    await history.refreshAttempts();
    await history.refreshHistory();
    navigateTo('results');
  }, [session, loader.currentExamId, timer, modals, history, navigateTo]);

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
      loader.selectExam(data.exam_id);
      session.loadPastAttempt(data);
      navigateTo('results');
    } catch {
      showError('Не удалось загрузить сохранённую попытку');
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
    navigateTo('welcome');
  }, [modals, navigateTo]);

  const navigateHome = useCallback(() => {
    if (screen === 'exam' && !session.isSubmitted && session.answeredCount > 0) {
      modals.openLeaveModal();
    } else {
      navigateTo('welcome');
    }
  }, [screen, session, modals, navigateTo]);

  const resetExam = useCallback(() => {
    startExam({ timed: timer.isTimed });
  }, [startExam, timer.isTimed]);

  return {
    startExam,
    startRandomExam,
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
