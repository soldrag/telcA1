import React from 'react';
import { RotateCcw, AlertTriangle, Share2 } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function ResultsActionBar({
  mistakesCount = 0,
  onResetExam,
  onRetakeMistakes,
  onOpenHistory,
  onShareResult,
  isTeacherReview = false,
}) {
  const { t } = useI18n();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-card p-4 rounded-2xl border border-border-default shadow-xs">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onResetExam}
          className="flex items-center space-x-2 px-4 py-2 bg-action-primary hover:bg-action-primary-hover text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors min-h-[44px] cursor-pointer focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{t('results.retakeExam')}</span>
        </button>

        {!isTeacherReview && mistakesCount > 0 && onRetakeMistakes && (
          <button
            type="button"
            onClick={onRetakeMistakes}
            className="flex items-center space-x-2 px-4 py-2 bg-state-warning hover:bg-state-warning-hover text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors min-h-[44px] cursor-pointer focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>{t('results.reviewMistakes', { count: mistakesCount })}</span>
          </button>
        )}

        {!isTeacherReview && onShareResult && (
          <button
            type="button"
            onClick={onShareResult}
            className="flex items-center space-x-2 px-4 py-2 bg-surface-raised hover:bg-action-primary-subtle text-content-primary hover:text-action-primary text-xs sm:text-sm font-bold rounded-xl border border-border-default hover:border-action-primary-border shadow-xs transition-colors min-h-[44px] cursor-pointer focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2"
          >
            <Share2 className="w-4 h-4" />
            <span>{t('results.shareResult')}</span>
          </button>
        )}
      </div>

      {!isTeacherReview && (
        <button
          type="button"
          onClick={onOpenHistory}
          className="text-xs sm:text-sm text-content-secondary hover:text-content-primary font-semibold px-3 py-2 rounded-xl hover:bg-surface-raised transition-colors min-h-[44px] cursor-pointer focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2"
        >
          {t('results.viewHistory')}
        </button>
      )}
    </div>
  );
}
