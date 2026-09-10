import { useState, useCallback, useEffect } from 'react';
import { attemptStorage as defaultAttemptStorage } from '../services/storage/index.js';

export function useAttemptHistory(activeTestType = 'lesen', storage = defaultAttemptStorage) {
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
  }, [refreshAttempts]);

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
