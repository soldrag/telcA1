import React from 'react';

export default function ResultsFilterBar({
  filter,
  onSetFilter,
  totalQuestions,
  mistakesCount,
  score,
  isAllExpanded,
  onToggleExpandAll,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
      <div>
        <h3 className="text-xl font-bold text-slate-900">
          Таблица результатов и разбор ответов
        </h3>
        <p className="text-xs sm:text-sm text-slate-500">
          Нажмите на задание, чтобы прочитать подробное объяснение на русском языке с цитатой из текста.
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => onSetFilter('all')}
            className={`px-3 py-1 rounded-lg transition-all min-h-[44px] focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 ${
              filter === 'all'
                ? 'bg-white text-slate-900 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Все ({totalQuestions})
          </button>
          <button
            type="button"
            onClick={() => onSetFilter('mistakes')}
            className={`px-3 py-1 rounded-lg transition-all flex items-center space-x-1 min-h-[44px] focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 ${
              filter === 'mistakes'
                ? 'bg-rose-50 text-rose-700 shadow-sm font-bold border border-rose-200'
                : 'text-slate-600 hover:text-rose-600'
            }`}
          >
            <span>Ошибки</span>
            <span className="bg-rose-200 text-rose-800 text-xs px-2 py-1 rounded-full font-extrabold">
              {mistakesCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => onSetFilter('correct')}
            className={`px-3 py-1 rounded-lg transition-all flex items-center space-x-1 min-h-[44px] focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 ${
              filter === 'correct'
                ? 'bg-emerald-50 text-emerald-700 shadow-sm font-bold border border-emerald-200'
                : 'text-slate-600 hover:text-emerald-600'
            }`}
          >
            <span>Верно</span>
            <span className="bg-emerald-200 text-emerald-800 text-xs px-2 py-1 rounded-full font-extrabold">
              {score}
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={onToggleExpandAll}
          className="text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap min-h-[44px] focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2"
        >
          {isAllExpanded ? 'Свернуть все' : 'Развернуть все'}
        </button>
      </div>
    </div>
  );
}
