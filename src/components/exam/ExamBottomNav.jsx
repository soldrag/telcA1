import React from 'react';

export default function ExamBottomNav({
  pagination = {},
  actions = {},
  activeTeil = pagination.activeTeil,
  maxTeile = pagination.maxTeile,
  onPreviousTeil = actions.onPreviousTeil,
  onNextTeil = actions.onNextTeil,
  onSubmit = actions.onSubmit,
}) {
  return (
    <div className="bg-surface-card rounded-2xl border-2 border-border-default p-4 sm:p-5 flex items-center justify-between shadow-sm">
      <button
        type="button"
        disabled={activeTeil === 1}
        onClick={onPreviousTeil}
        className="px-6 py-3 text-sm font-black text-content-primary bg-surface-card hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl border-2 border-border-default transition-colors min-h-[44px] whitespace-nowrap focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2"
      >
        ← Предыдущая часть
      </button>

      <div className="text-sm font-black text-content-primary bg-surface-inset px-4 py-2 rounded-lg border border-border-subtle hidden sm:block whitespace-nowrap">
        Часть {activeTeil} из {maxTeile}
      </div>

      {activeTeil < maxTeile ? (
        <button
          type="button"
          onClick={onNextTeil}
          className="px-6 py-2.5 text-sm font-black text-white bg-telc-700 hover:bg-telc-800 rounded-xl shadow-sm transition-colors border-2 border-telc-800 min-h-[44px] whitespace-nowrap focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2"
        >
          Следующая часть →
        </button>
      ) : (
        <button
          type="button"
          onClick={onSubmit}
          className="px-6 py-2.5 text-sm font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/30 transition-all scale-105 border-2 border-emerald-700 min-h-[44px] whitespace-nowrap focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2"
        >
          Завершить экзамен ✓
        </button>
      )}
    </div>
  );
}
