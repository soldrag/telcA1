import React from 'react';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function ExamBottomNav({
  pagination = {},
  actions = {},
  activeTeil = pagination.activeTeil,
  maxTeile = pagination.maxTeile,
  onPreviousTeil = actions.onPreviousTeil,
  onNextTeil = actions.onNextTeil,
  onSubmit = actions.onSubmit,
}) {
  const { t, isRussian } = useI18n();

  return (
    <nav
      aria-label="Навигация по разделам экзамена"
      className="sticky bottom-0 z-40 bg-surface-card/95 backdrop-blur-md border-t-2 border-border-default py-3.5 px-4 sm:px-6 -mx-4 sm:-mx-6 lg:-mx-8 rounded-b-none sm:rounded-2xl shadow-lg flex items-center justify-between gap-3"
    >
      <button
        type="button"
        disabled={activeTeil === 1}
        onClick={onPreviousTeil}
        className="px-5 sm:px-6 py-2.5 text-xs sm:text-sm font-black text-content-primary bg-surface-card hover:bg-surface-raised disabled:opacity-30 disabled:cursor-not-allowed rounded-xl border-2 border-border-default transition-colors min-h-[44px] whitespace-nowrap focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 cursor-pointer"
      >
        ← {t('exam.navPrevious')}
      </button>

      <div className="text-xs sm:text-sm font-black text-content-primary bg-surface-inset px-4 py-2 rounded-lg border border-border-subtle hidden sm:block whitespace-nowrap">
        {isRussian ? `Часть ${activeTeil} из ${maxTeile}` : `Part ${activeTeil} of ${maxTeile}`}
      </div>

      {activeTeil < maxTeile ? (
        <button
          type="button"
          onClick={onNextTeil}
          className="px-5 sm:px-6 py-2.5 text-xs sm:text-sm font-black text-white bg-action-primary hover:bg-action-primary-hover rounded-xl shadow-md transition-colors border-2 border-action-primary-hover min-h-[44px] whitespace-nowrap focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 cursor-pointer"
        >
          {t('exam.navNext')} →
        </button>
      ) : (
        <button
          type="button"
          onClick={onSubmit}
          className="px-5 sm:px-6 py-2.5 text-xs sm:text-sm font-black text-white bg-state-success hover:bg-state-success-hover rounded-xl shadow-md shadow-state-success/30 transition-all scale-105 border-2 border-state-success-hover min-h-[44px] whitespace-nowrap focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 cursor-pointer"
        >
          {t('exam.navFinish')} ✓
        </button>
      )}
    </nav>
  );
}
