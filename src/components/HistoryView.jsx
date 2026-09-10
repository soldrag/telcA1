import React, { useState } from 'react';
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

  const handleConfirmClear = () => {
    onClearHistory?.();
    setShowClearConfirm(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="h-16" />
      <HistoryTopNav onBack={onBack} />

      <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-6">
        <HistoryStatsGrid attempts={attempts} />

        <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 flex items-center space-x-2 text-xs text-emerald-900">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Вся история и разборы хранятся исключительно в памяти вашего браузера. Сервер не сохраняет ваши результаты.</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <h2 className="text-xl font-bold text-slate-900">История тестов</h2>
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
                  className="flex items-center space-x-1 text-xs text-slate-500 hover:text-rose-600 font-semibold px-3 py-2 rounded-lg hover:bg-rose-50 transition-colors focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 min-h-[36px]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Очистить историю</span>
                </button>
              )
            )}
            <button
              type="button"
              onClick={onRefresh}
              className="flex items-center space-x-1 text-xs text-telc-600 hover:text-telc-700 font-semibold px-3 py-2 rounded-lg hover:bg-telc-50 transition-colors focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 min-h-[36px]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
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
