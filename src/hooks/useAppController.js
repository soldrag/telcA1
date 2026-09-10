import { useState, useCallback, useEffect } from 'react';
import { useExamSession } from './useExamSession.js';
import { useExamTimer } from './useExamTimer.js';
import { useAttemptHistory } from './useAttemptHistory.js';
import { useModalCoordinator } from './useModalCoordinator.js';
import { useExamLoader } from './useExamLoader.js';
import { attemptStorage as defaultAttemptStorage } from '../services/storage/index.js';
import { getNextBalancedExam } from '../utils/examBalancer.js';
import { scrollToTop } from '../utils/scrollService.js';

function getExamDurationSeconds(details) {
  return (details?.exam?.time_limit_minutes || 25) * 60;
}

export function useAppController({ storage = defaultAttemptStorage, api } = {}) {
  const [screen, setScreen] = useState('welcome');
  const [errorMessage, setErrorMessage] = useState(null);

  const showError = useCallback((message) => setErrorMessage(message), []);
  const dismissError = useCallback(() => setErrorMessage(null), []);

  const loader = useExamLoader({ api, onError: showError });
  const modals = useModalCoordinator();
  const session = useExamSession({ storage });
  const timer = useExamTimer(25 * 60);
  const history = useAttemptHistory(loader.activeTestType, { storage });

  const navigateTo = useCallback((targetScreen) => {
    setScreen(targetScreen);
    scrollToTop();
  }, []);

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
      console.warn('[useAppController] Balancer fallback:', balancerError);
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
    history.refreshAttempts();
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
    screen,
    navigateTo,
    navigateHome,
    openHistory,
    retakeMistakes,
    leaveExam,
    resetExam,
    errorMessage,
    showError,
    dismissError,
    exams: loader.exams,
    testTypes: loader.testTypes,
    activeTestType: loader.activeTestType,
    changeTestType: loader.changeTestType,
    currentExamId: loader.currentExamId,
    selectExam: loader.selectExam,
    examData: loader.examData,
    modals,
    session,
    timer,
    history,
    startExam,
    startRandomExam,
    submitExam,
    loadSavedAttempt,
    handleTimeUp,
  };
}
