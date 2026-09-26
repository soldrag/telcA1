import React from 'react';
import { ArrowRight } from 'lucide-react';
import { formatExamName } from '../../utils/examFormat.js';
import { formatDayMonth } from '../../utils/historyFormat.js';
import { getAttemptMaxScore } from '../../utils/attemptStats.js';
import { useI18n } from '../../i18n/I18nContext.jsx';

const FOCUS_RING = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2';

function RecentAttemptRow({ attempt, onLoadAttempt }) {
  const { t, language } = useI18n();
  const name = formatExamName(attempt.exam_id || attempt.exam_title);
  const date = formatDayMonth(attempt.created_at, language);

  return (
    <li>
      <button
        type="button"
        onClick={() => onLoadAttempt(attempt.id)}
        className={`w-full min-h-[48px] px-3 rounded-xl flex items-center justify-between gap-3 text-left hover:bg-surface-raised cursor-pointer transition-colors ${FOCUS_RING}`}
      >
        <span className="text-sm text-content-primary truncate">{name} · {date}</span>
        <span className="flex items-center gap-3 shrink-0">
          <span className={`text-sm font-semibold tabular-nums ${attempt.passed ? 'text-state-success-text' : 'text-state-error-text'}`}>
            {attempt.score}/{getAttemptMaxScore(attempt)}
          </span>
          <span className="text-sm text-action-primary">{t('welcome.recentAttempts.reviewLink')}</span>
        </span>
      </button>
    </li>
  );
}

export default function RecentAttemptsList({ recentAttempts = [], onOpenHistory, onLoadAttempt }) {
  const { t } = useI18n();

  return (
    <section aria-labelledby="recent-attempts-title" className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <h2 id="recent-attempts-title" className="text-sm font-medium text-content-secondary">{t('welcome.recentAttempts.title')}</h2>
        <button
          type="button"
          onClick={onOpenHistory}
          className={`min-h-[44px] px-1 text-sm text-action-primary hover:text-action-primary-hover flex items-center gap-1 cursor-pointer ${FOCUS_RING}`}
        >
          {t('welcome.recentAttempts.viewAll')}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      {recentAttempts.length === 0 ? (
        <p className="text-sm text-content-muted py-2">{t('welcome.recentAttempts.empty')}</p>
      ) : (
        <ul className="rounded-2xl bg-surface-card border border-border-default p-1">
          {recentAttempts.map((attempt) => (
            <RecentAttemptRow key={attempt.id} attempt={attempt} onLoadAttempt={onLoadAttempt} />
          ))}
        </ul>
      )}
    </section>
  );
}
