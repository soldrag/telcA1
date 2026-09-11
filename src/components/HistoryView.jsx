import React, { useState, useEffect } from 'react';
import { RotateCcw, Trash2, ShieldCheck } from 'lucide-react';
import HistoryTopNav from './history/HistoryTopNav.jsx';
import HistoryStatsGrid from './history/HistoryStatsGrid.jsx';
import HistoryClearConfirm from './history/HistoryClearConfirm.jsx';
import HistoryListContainer from './history/HistoryListContainer.jsx';

export default function HistoryView({
  navigation = {},
  actions = {},
  state = {},
  onBack = navigation.onBack,
  onLoadAttempt = actions.onLoadAttempt,
  onStartExam = actions.onStartExam,
  onClearHistory = actions.onClearHistory,
  onRefresh = actions.onRefresh,
  attempts = state.attempts || [],
  loading = state.loading || false,
}) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    onRefresh?.();
  }, [onRefresh]);

  const handleConfirmClear = () => {
    onClearHistory?.();
    setShowClearConfirm(false);
  };

  return (
    <div className="min-h-screen bg-bg-canvas text-content-primary">
      <div className="h-16" />
      <HistoryTopNav onBack={onBack} />

      <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-6">
        <HistoryStatsGrid attempts={attempts} />

        <div className="bg-state-success-subtle border border-state-success-border rounded-2xl p-4 flex items-center space-x-3 text-xs text-state-success-text">
          <ShieldCheck className="w-4 h-4 text-state-success flex-shrink-0" />
          <span>Вся история и разборы хранятся исключительно в памяти вашего браузера. Сервер не сохраняет ваши результаты.</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <h2 className="text-xl font-bold text-content-primary">История тестов</h2>
          <div className="flex items-center space-x-2">
            {attempts.length > 0 && (
              showClearConfirm ? (
                <HistoryClearConfirm
                  onConfirm={handleConfirmClear}
                  onCancel={() => setShowClearConfirm(false)}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  className="flex items-center space-x-1 text-xs text-content-secondary hover:text-state-error font-semibold px-3 py-2 rounded-xl hover:bg-state-error-subtle transition-colors focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 min-h-[44px] cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Очистить историю</span>
                </button>
              )
            )}
            <button
              type="button"
              onClick={onRefresh}
              className="flex items-center space-x-1 text-xs text-action-primary hover:text-action-primary-hover font-semibold px-3 py-2 rounded-xl hover:bg-action-primary-subtle transition-colors focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 min-h-[44px] cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Обновить</span>
            </button>
          </div>
        </div>

        <HistoryListContainer
          loading={loading}
          attempts={attempts}
          onLoadAttempt={onLoadAttempt}
          onStartExam={onStartExam}
        />
      </div>
    </div>
  );
}
