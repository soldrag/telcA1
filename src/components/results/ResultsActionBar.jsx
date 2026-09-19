import React, { useState } from 'react';
import { RotateCcw, AlertTriangle, Share2, Copy, Check } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function ResultsActionBar({
  mistakesCount = 0,
  onResetExam,
  onRetakeMistakes,
  onOpenHistory,
  onShareResult,
  isTeacherReview = false,
  isAssignment = false,
  shareSubmissionUrl = null,
}) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const handleCopySubmission = async () => {
    if (!shareSubmissionUrl) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareSubmissionUrl);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-card p-4 rounded-2xl border border-border-default shadow-xs min-w-0">
      <div className="flex flex-wrap items-center gap-2 min-w-0">
        {!isTeacherReview && !isAssignment && onResetExam && (
          <button
            type="button"
            onClick={onResetExam}
            className="flex items-center space-x-2 px-4 py-2 bg-action-primary hover:bg-action-primary-hover text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors min-h-[44px] cursor-pointer focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t('results.retakeExam')}</span>
          </button>
        )}

        {isAssignment && shareSubmissionUrl && (
          <button
            type="button"
            onClick={handleCopySubmission}
            className="flex items-center space-x-2 px-4 py-2 bg-action-primary hover:bg-action-primary-hover text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors min-h-[44px] cursor-pointer focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? t('results.submissionLinkCopied') : t('results.copySubmissionLink')}</span>
          </button>
        )}

        {!isTeacherReview && !isAssignment && mistakesCount > 0 && onRetakeMistakes && (
          <button
            type="button"
            onClick={onRetakeMistakes}
            className="flex items-center space-x-2 px-4 py-2 bg-state-warning hover:bg-state-warning-hover text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors min-h-[44px] cursor-pointer focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>{t('results.reviewMistakes', { count: mistakesCount })}</span>
          </button>
        )}

        {!isTeacherReview && !isAssignment && onShareResult && (
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

      {!isTeacherReview && onOpenHistory && (
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
