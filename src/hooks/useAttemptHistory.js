import { useState, useCallback, useEffect } from 'react';
import { attemptStorage as defaultAttemptStorage } from '../services/storage/index.js';

export function resolveAttemptStorage(optionsOrStorage) {
  if (!optionsOrStorage) return defaultAttemptStorage;
  if (typeof optionsOrStorage === 'object' && optionsOrStorage.storage) {
    return optionsOrStorage.storage;
  }
  return optionsOrStorage;
}

export function useAttemptHistory(activeTestTypeOrOptions = 'lesen', optionsOrStorage = defaultAttemptStorage) {
  let activeTestType = 'lesen';
  let storage = defaultAttemptStorage;

  if (activeTestTypeOrOptions && typeof activeTestTypeOrOptions === 'object' && !('getAttempts' in activeTestTypeOrOptions)) {
    activeTestType = activeTestTypeOrOptions.activeTestType || activeTestTypeOrOptions.testType || 'lesen';
    storage = resolveAttemptStorage(activeTestTypeOrOptions.storage);
  } else {
    activeTestType = activeTestTypeOrOptions || 'lesen';
    storage = resolveAttemptStorage(optionsOrStorage);
  }

  const [recentAttempts, setRecentAttempts] = useState([]);
  const [historyAttempts, setHistoryAttempts] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);

  const refreshAttempts = useCallback(async () => {
    try {
      setHistoryError(null);
      const attemptsList = await storage.getAttempts({ testType: activeTestType, limit: 3 });
      setRecentAttempts(attemptsList);
    } catch (error) {
      setHistoryError('Не удалось загрузить недавние попытки');
    }
  }, [activeTestType, storage]);

  const refreshHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const attemptsList = await storage.getAttempts();
      setHistoryAttempts(attemptsList);
    } catch (error) {
      setHistoryError('Не удалось загрузить историю экзаменов');
    } finally {
      setHistoryLoading(false);
    }
  }, [storage]);

  const clearHistory = useCallback(async () => {
    try {
      await storage.clearAttempts();
      await refreshAttempts();
      await refreshHistory();
    } catch (error) {
      setHistoryError('Не удалось очистить историю');
    }
  }, [storage, refreshAttempts, refreshHistory]);

  useEffect(() => {
    refreshAttempts();
    refreshHistory();
  }, [refreshAttempts, refreshHistory]);

  return {
    recentAttempts,
    historyAttempts,
    historyLoading,
    historyError,
    refreshAttempts,
    refreshHistory,
    clearHistory,
  };
}
