import React from 'react';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function ResultsFilterTabs({
  filter,
  onSetFilter,
  totalQuestions,
  mistakesCount,
  score,
}) {
  const { t } = useI18n();

  return (
    <div className="flex items-center bg-surface-inset p-1 rounded-xl border border-border-default text-[11px] sm:text-xs font-semibold overflow-x-auto max-w-full">
      <button
        type="button"
        onClick={() => onSetFilter('all')}
        className={`px-2 sm:px-3 py-1 rounded-lg transition-all min-h-[38px] sm:min-h-[44px] cursor-pointer focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 shrink-0 ${
          filter === 'all'
            ? 'bg-surface-card text-content-primary shadow-xs font-bold'
            : 'text-content-secondary hover:text-content-primary'
        }`}
      >
        {t('results.tabAll', { count: totalQuestions })}
      </button>

      <button
        type="button"
        onClick={() => onSetFilter('mistakes')}
        className={`px-2 sm:px-3 py-1 rounded-lg transition-all flex items-center space-x-1 sm:space-x-1.5 min-h-[38px] sm:min-h-[44px] cursor-pointer focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 shrink-0 ${
          filter === 'mistakes'
            ? 'bg-state-error-subtle text-state-error-text shadow-xs font-bold border border-state-error-border'
            : 'text-content-secondary hover:text-state-error'
        }`}
      >
        <span>{t('results.tabMistakes')}</span>
        <span className="bg-state-error-muted text-state-error-text text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-extrabold">
          {mistakesCount}
        </span>
      </button>

      <button
        type="button"
        onClick={() => onSetFilter('correct')}
        className={`px-2 sm:px-3 py-1 rounded-lg transition-all flex items-center space-x-1 sm:space-x-1.5 min-h-[38px] sm:min-h-[44px] cursor-pointer focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 shrink-0 ${
          filter === 'correct'
            ? 'bg-state-success-subtle text-state-success-text shadow-xs font-bold border border-state-success-border'
            : 'text-content-secondary hover:text-state-success'
        }`}
      >
        <span>{t('results.tabCorrect')}</span>
        <span className="bg-state-success-muted text-state-success-text text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-extrabold">
          {score}
        </span>
      </button>
    </div>
  );
}
