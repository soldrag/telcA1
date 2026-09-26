import React from 'react';
import { ArrowRight } from 'lucide-react';
import { formatExamName } from '../../utils/examFormat.js';
import { formatDayMonth } from '../../utils/historyFormat.js';
import { getAttemptMaxScore } from '../../utils/attemptStats.js';
import { formatPoints } from '../../utils/formatPoints.js';
import { useI18n } from '../../i18n/I18nContext.jsx';

const FOCUS_RING = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2';

// The change against the previous attempt at the same variant, when it is among the recent ones.
function findDelta(attempt, olderAttempts) {
  const previous = olderAttempts.find((other) => other.exam_id === attempt.exam_id);
  return previous ? (Number(attempt.score) || 0) - (Number(previous.score) || 0) : null;
}

function DeltaBadge({ delta, t, language }) {
  if (!delta) return null;
  const text = `${delta > 0 ? '↑ +' : '↓ −'}${formatPoints(Math.abs(delta), language)}`;
  return (
    <span className={`text-xs tabular-nums ${delta > 0 ? 'text-state-success-text' : 'text-state-error-text'}`} aria-label={t('welcome.recentAttempts.deltaAria', { delta: text })}>
      {text}
    </span>
  );
}

function RecentAttemptRow({ attempt, delta, onLoadAttempt }) {
  const { t, language } = useI18n();
  const name = formatExamName(attempt.exam_id || attempt.exam_title);
  const date = formatDayMonth(attempt.created_at, language);

  return (
    <li>
      <button
        type="button"
        onClick={() => onLoadAttempt(attempt.id)}
        className={`w-full min-h-[3rem] px-3 rounded-xl flex items-center justify-between gap-3 text-left hover:bg-surface-raised cursor-pointer transition-colors ${FOCUS_RING}`}
      >
        <span className="flex items-center gap-2.5 min-w-0">
          <span aria-hidden="true" className={`w-2 h-2 rounded-full shrink-0 ${attempt.passed ? 'bg-state-success' : 'bg-state-error'}`} />
          <span className="text-sm text-content-primary truncate">{name} · {date}</span>
        </span>
        <span className="flex items-center gap-3 shrink-0">
          <span className="flex items-baseline gap-1.5">
            <span className="text-sm font-semibold tabular-nums text-content-primary">
              {formatPoints(attempt.score, language)}/{getAttemptMaxScore(attempt)}
            </span>
            <DeltaBadge delta={delta} t={t} language={language} />
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
          className={`min-h-[2.75rem] px-1 text-sm text-action-primary hover:text-action-primary-hover flex items-center gap-1 cursor-pointer ${FOCUS_RING}`}
        >
          {t('welcome.recentAttempts.viewAll')}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      {recentAttempts.length === 0 ? (
        <p className="text-sm text-content-muted py-2">{t('welcome.recentAttempts.empty')}</p>
      ) : (
        <ul className="rounded-2xl bg-surface-card border border-border-default p-1 grid sm:grid-cols-2 lg:grid-cols-1 gap-x-2">
          {recentAttempts.map((attempt, idx) => (
            <RecentAttemptRow key={attempt.id} attempt={attempt} delta={findDelta(attempt, recentAttempts.slice(idx + 1))} onLoadAttempt={onLoadAttempt} />
          ))}
        </ul>
      )}
    </section>
  );
}
