import React from 'react';
import { CheckCircle2, XCircle, Calendar, Clock, Eye, ChevronRight } from 'lucide-react';
import { cleanExamTitle, formatAttemptDate, formatAttemptDuration } from '../../utils/historyFormat.js';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function HistoryItemCard({ attempt, onSelect, compact = false }) {
  const { t, language } = useI18n();
  const { minutes, seconds } = formatAttemptDuration(attempt.time_spent_seconds);
  const formattedDate = formatAttemptDate(attempt.created_at, language);
  const examTitle = cleanExamTitle(attempt.exam_title);

  const statusBadgeClass = attempt.passed
    ? 'bg-state-success-subtle text-state-success-text border-state-success-border'
    : 'bg-state-error-subtle text-state-error-text border-state-error-border';

  const iconContainerClass = attempt.passed
    ? 'bg-state-success-subtle text-state-success border-state-success-border'
    : 'bg-state-error-subtle text-state-error border-state-error-border';

  return (
    <button
      type="button"
      onClick={() => onSelect(attempt.id)}
      className={`w-full text-left transition-all cursor-pointer flex items-center justify-between gap-4 group focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 min-h-[44px] ${
        compact
          ? 'p-4 rounded-2xl border border-border-default hover:border-action-primary hover:bg-action-primary-subtle/30'
          : 'p-4 sm:p-6 hover:bg-surface-raised'
      }`}
    >
      <div className="flex items-center space-x-4 min-w-0">
        <div className={`flex-shrink-0 flex items-center justify-center border ${
          compact ? 'w-10 h-10 rounded-xl' : 'w-12 h-12 rounded-2xl'
        } ${iconContainerClass}`}>
          {attempt.passed ? (
            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
          ) : (
            <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={`font-bold text-content-primary truncate ${compact ? 'text-sm' : 'text-base'}`}>
              {examTitle}
            </span>
            <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${statusBadgeClass}`}>
              {attempt.passed ? t('history.passedBadge') : t('history.failedBadge')}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-content-tertiary">
            <span className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-content-muted" />
              <span>{formattedDate}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-content-muted" />
              <span>{t('history.duration', { minutes, seconds })}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3 flex-shrink-0">
        <div className="text-right">
          <div className={`font-black text-content-primary ${compact ? 'text-sm sm:text-base' : 'text-lg'}`}>
            {attempt.score} <span className="text-xs sm:text-sm font-medium text-content-tertiary">/ {attempt.total_questions}</span>
          </div>
          <div className={`text-xs font-bold ${attempt.passed ? 'text-state-success' : 'text-state-error'}`}>
            {attempt.percentage}%
          </div>
        </div>

        <div className="flex items-center">
          {compact ? (
            <ChevronRight className="w-5 h-5 text-content-muted group-hover:text-action-primary transition-colors" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-surface-card border border-border-default flex items-center justify-center text-content-muted group-hover:bg-action-primary-subtle group-hover:text-action-primary group-hover:border-action-primary-border transition-all">
              <Eye className="w-5 h-5" />
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
