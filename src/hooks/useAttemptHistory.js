import { useState, useCallback, useEffect } from 'react';
import { attemptStorage } from '../services/storage/index.js';

export function useAttemptHistory(activeTestType = 'lesen') {
  const [recentAttempts, setRecentAttempts] = useState([]);
  const [historyAttempts, setHistoryAttempts] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const refreshAttempts = useCallback(async () => {
    try {
      const list = await attemptStorage.getAttempts({ testType: activeTestType, limit: 3 });
      setRecentAttempts(list);
    } catch (err) {
      console.error('Failed to load recent attempts:', err);
    }
  }, [activeTestType]);

  const refreshHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const list = await attemptStorage.getAttempts();
      setHistoryAttempts(list);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const clearHistory = useCallback(async () => {
    await attemptStorage.clearAttempts();
    await refreshAttempts();
    await refreshHistory();
  }, [refreshAttempts, refreshHistory]);

  useEffect(() => {
    refreshAttempts();
  }, [refreshAttempts]);

  return {
    recentAttempts,
    historyAttempts,
    historyLoading,
    refreshAttempts,
    refreshHistory,
    clearHistory,
  };
}
