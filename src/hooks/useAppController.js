import { useState, useCallback } from 'react';
import { useExamSession } from './useExamSession.js';
import { useExamTimer } from './useExamTimer.js';
import { useAttemptHistory } from './useAttemptHistory.js';
import { useModalCoordinator } from './useModalCoordinator.js';
import { useExamLoader } from './useExamLoader.js';
import { useExamFlowActions } from './useExamFlowActions.js';
import { attemptStorage as defaultAttemptStorage } from '../services/storage/index.js';
import { scrollToTop } from '../utils/scrollService.js';

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

  const flowActions = useExamFlowActions({
    screen,
    loader,
    session,
    timer,
    modals,
    history,
    storage,
    navigateTo,
    showError,
  });

  return {
    screen,
    navigateTo,
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
    isLoadingExam: loader.isLoadingExam,
    modals,
    session,
    timer,
    history,
    ...flowActions,
  };
}
