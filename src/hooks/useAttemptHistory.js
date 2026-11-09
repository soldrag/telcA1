import { useState, useCallback, useEffect } from 'react';

/**
 * Recent attempts of the active module and the full history, read from the attempt storage port.
 * Load failures go to `onError` as translation keys (the app's error banner).
 */
export function useAttemptHistory({ activeTestType, storage, onError }) {
  const [recentAttempts, setRecentAttempts] = useState([]);
  const [historyAttempts, setHistoryAttempts] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const refreshAttempts = useCallback(async () => {
    try {
      setRecentAttempts(await storage.getAttempts({ testType: activeTestType, limit: 5 }));
    } catch {
      onError('errors.loadRecentAttempts');
    }
  }, [activeTestType, storage, onError]);

  const refreshHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      setHistoryAttempts(await storage.getAttempts());
    } catch {
      onError('errors.loadHistory');
    } finally {
      setHistoryLoading(false);
    }
  }, [storage, onError]);

  const clearHistory = useCallback(async () => {
    try {
      await storage.clearAttempts();
    } catch {
      onError('errors.clearHistory');
    }
    await refreshAttempts();
    await refreshHistory();
  }, [storage, onError, refreshAttempts, refreshHistory]);

  useEffect(() => {
    refreshAttempts();
    refreshHistory();
  }, [refreshAttempts, refreshHistory]);

  return {
    recentAttempts,
    historyAttempts,
    historyLoading,
    refreshAttempts,
    refreshHistory,
    clearHistory,
  };
}
