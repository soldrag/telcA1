import React from 'react';
import { History, ArrowRight, CheckCircle2, XCircle, Share2 } from 'lucide-react';
import { formatExamName } from '../../utils/examFormat.js';
import { formatAttemptDateShort, formatAttemptDuration } from '../../utils/historyFormat.js';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function RecentAttemptsList({
  recentAttempts = [],
  onOpenHistory,
  onLoadAttempt,
  onShareAttempt,
}) {
  return (
    <div className="bg-surface-card rounded-3xl border border-border-subtle p-6 sm:p-8 shadow-sm space-y-4">
      <RecentAttemptsHeader onOpenHistory={onOpenHistory} />
      {recentAttempts.length === 0 ? (
        <RecentAttemptsEmpty />
      ) : (
        <div className="space-y-2">
          {recentAttempts.map((attempt) => (
            <RecentAttemptRow
              key={attempt.id}
              attempt={attempt}
              onLoadAttempt={onLoadAttempt}
              onShareAttempt={onShareAttempt}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RecentAttemptsHeader({ onOpenHistory }) {
  const { t } = useI18n();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <div className="p-2 bg-surface-inset text-content-secondary rounded-xl">
          <History className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-base font-bold text-content-primary">
            {t('welcome.recentAttempts.title')}
          </h2>
          <p className="text-xs text-content-tertiary">
            {t('welcome.recentAttempts.browserStored')}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onOpenHistory}
        className="text-xs sm:text-sm font-bold text-action-primary hover:text-action-primary-hover flex items-center space-x-1 min-h-[44px] focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 cursor-pointer"
      >
        <span>{t('welcome.recentAttempts.viewAll')}</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function RecentAttemptsEmpty() {
  const { t } = useI18n();

  return (
    <div className="text-center py-6 text-content-muted text-xs sm:text-sm bg-surface-inset rounded-2xl border border-dashed border-border-subtle">
      {t('welcome.recentAttempts.empty')}
    </div>
  );
}

function RecentAttemptRow({ attempt, onLoadAttempt, onShareAttempt }) {
  const { t, language } = useI18n();
  const { minutes, seconds } = formatAttemptDuration(attempt.time_spent_seconds);
  const formattedDate = formatAttemptDateShort(attempt.created_at, language);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onLoadAttempt(attempt.id)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onLoadAttempt(attempt.id); }}
      className="w-full p-3 rounded-xl border border-border-subtle hover:border-border-strong hover:bg-surface-raised transition-all cursor-pointer flex items-center justify-between gap-3 group min-h-[44px] focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2"
    >
      <div className="flex items-center space-x-3">
        {attempt.passed ? (
          <CheckCircle2 className="w-5 h-5 text-state-success flex-shrink-0" />
        ) : (
          <XCircle className="w-5 h-5 text-state-error flex-shrink-0" />
        )}

        <div className="text-left">
          <div className="flex items-center space-x-2">
            <span className="text-xs sm:text-sm font-bold text-content-primary">
              {formatExamName(attempt.exam_id || attempt.exam_title)}
            </span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
              attempt.passed
                ? 'bg-state-success-subtle text-state-success-text border-state-success-border'
                : 'bg-state-error-subtle text-state-error-text border-state-error-border'
            }`}>
              {attempt.passed ? t('welcome.recentAttempts.passedBadge') : t('welcome.recentAttempts.failedBadge')}
            </span>
          </div>
          <div className="text-xs text-content-tertiary mt-0.5">
            {formattedDate} • {t('welcome.recentAttempts.duration', { minutes, seconds })}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
        <span className="font-extrabold text-xs sm:text-sm text-content-primary">
          {attempt.score} / {attempt.total_questions} ({attempt.percentage}%)
        </span>

        {onShareAttempt && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onShareAttempt(attempt);
            }}
            title={t('history.shareAttempt')}
            className="p-2 rounded-lg text-content-muted hover:text-action-primary hover:bg-action-primary-subtle transition-colors cursor-pointer flex items-center justify-center min-h-[36px] min-w-[36px]"
          >
            <Share2 className="w-4 h-4" />
          </button>
        )}

        <span className="text-xs text-action-primary group-hover:underline hidden sm:inline font-semibold">
          {t('welcome.recentAttempts.reviewLink')}
        </span>
      </div>
    </div>
  );
}
