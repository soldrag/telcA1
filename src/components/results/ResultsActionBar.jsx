import React from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

export default function ResultsActionBar({
  mistakesCount = 0,
  onResetExam,
  onRetakeMistakes,
  onOpenHistory,
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={onResetExam}
          className="flex items-center space-x-2 px-4 py-2 bg-telc-600 hover:bg-telc-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-colors min-h-[44px] focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Пройти этот тест заново</span>
        </button>

        {mistakesCount > 0 && onRetakeMistakes && (
          <button
            type="button"
            onClick={onRetakeMistakes}
            className="flex items-center space-x-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-colors min-h-[44px] focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Работа над ошибками ({mistakesCount})</span>
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={onOpenHistory}
        className="text-xs sm:text-sm text-slate-600 hover:text-slate-900 font-semibold px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors min-h-[44px] focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2"
      >
        Посмотреть историю попыток
      </button>
    </div>
  );
}
