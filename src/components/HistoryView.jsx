import React, { useState } from 'react';
import { ArrowLeft, Clock, RotateCcw, Award, Trash2, ShieldCheck } from 'lucide-react';
import HistoryStatsGrid from './history/HistoryStatsGrid.jsx';
import HistoryItemCard from './history/HistoryItemCard.jsx';
import HistoryClearConfirm from './history/HistoryClearConfirm.jsx';

export default function HistoryView({
  onBack,
  onLoadAttempt,
  onStartExam,
  onClearHistory,
  attempts = [],
  loading = false,
  onRefresh,
}) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleConfirmClear = () => {
    if (onClearHistory) onClearHistory();
    setShowClearConfirm(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="h-16" />

      {/* Top Header */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-40 flex items-center justify-between px-4 sm:px-6">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 min-h-[44px] min-w-[44px]"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium text-sm sm:text-base">Назад</span>
        </button>

        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <h1 className="text-sm font-bold text-slate-900">Моя статистика</h1>
            <p className="text-xs text-slate-500">Результаты экзаменов</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-telc-100 flex items-center justify-center text-telc-700 hidden sm:flex">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-6">
        <HistoryStatsGrid attempts={attempts} />

        <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 flex items-center space-x-2 text-xs text-emerald-900">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Вся история и разборы хранятся исключительно в памяти вашего браузера. Сервер не сохраняет ваши результаты.</span>
        </div>

        {/* History List Header */}
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

        {/* List Content */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <HistoryLoadingSkeleton />
          ) : attempts.length === 0 ? (
            <HistoryEmptyState onStartExam={onStartExam} />
          ) : (
            <div className="divide-y divide-slate-100">
              {attempts.map((att) => (
                <HistoryItemCard
                  key={att.id}
                  attempt={att}
                  onSelect={onLoadAttempt}
                  compact={false}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function HistoryLoadingSkeleton() {
  return (
    <div className="p-8 text-center text-slate-500 text-sm space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-200 flex-shrink-0" />
            <div className="space-y-2">
              <div className="h-5 bg-slate-200 rounded w-48" />
              <div className="h-4 bg-slate-200 rounded w-32" />
            </div>
          </div>
          <div className="h-10 bg-slate-200 rounded w-24" />
        </div>
      ))}
    </div>
  );
}

function HistoryEmptyState({ onStartExam }) {
  return (
    <div className="p-12 text-center flex flex-col items-center">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <Clock className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">История пуста</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">
        Вы ещё не завершили ни одного экзамена. Пройдите свой первый тест, чтобы увидеть результаты здесь.
      </p>
      <button
        type="button"
        onClick={onStartExam}
        className="px-6 py-3 bg-telc-600 text-white font-bold rounded-xl hover:bg-telc-700 transition-colors focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 min-h-[44px]"
      >
        Начать экзамен
      </button>
    </div>
  );
}
