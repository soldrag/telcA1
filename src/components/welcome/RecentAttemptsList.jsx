import React from 'react';
import { ArrowRight } from 'lucide-react';
import { formatExamName } from '../../utils/examFormat.js';
import { formatDayMonth } from '../../utils/historyFormat.js';
import { getAttemptMaxScore } from '../../utils/attemptStats.js';
import { formatPoints } from '../../utils/formatPoints.js';
import { useI18n } from '../../i18n/I18nContext.jsx';
import Section from '../layout/Section.jsx';

const FOCUS_RING = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2';

// The change against the previous attempt at the same variant, when it is among the recent ones.
function findDelta(attempt, olderAttempts) {
  const previous = olderAttempts.find((other) => other.exam_id === attempt.exam_id);
  return previous ? (Number(attempt.score) || 0) - (Number(previous.score) || 0) : null;
}

function DeltaBadge({ delta, t, language }) {
  if (!delta) return <span aria-hidden="true" />;
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
        className={`w-full min-h-[3rem] px-3 py-1.5 rounded-xl grid grid-cols-[0.5rem_minmax(0,1fr)_3.25rem_2.75rem_auto] items-center gap-x-3 text-left hover:bg-surface-raised cursor-pointer transition-colors ${FOCUS_RING}`}
      >
        <span aria-hidden="true" className={`w-2 h-2 rounded-full ${attempt.passed ? 'bg-state-success' : 'bg-state-error'}`} />
        <span className="min-w-0 flex flex-col leading-tight">
          <span className="text-sm text-content-primary truncate">{name}</span>
          <span className="text-xs text-content-secondary">{date}</span>
        </span>
        <span className="text-sm font-semibold tabular-nums text-content-primary text-right">
          {formatPoints(attempt.score, language)}/{getAttemptMaxScore(attempt)}
        </span>
        <DeltaBadge delta={delta} t={t} language={language} />
        <span className="text-sm text-action-primary">{t('welcome.recentAttempts.reviewLink')}</span>
      </button>
    </li>
  );
}

// Every row is one grid, so the name, the score, the change and «Review» stand in columns.
export default function RecentAttemptsList({ recentAttempts = [], onOpenHistory, onLoadAttempt, className = '' }) {
  const { t } = useI18n();
  const viewAll = (
    <button
      type="button"
      onClick={onOpenHistory}
      className={`min-h-[2.75rem] px-1 text-sm text-action-primary hover:text-action-primary-hover flex items-center gap-1 cursor-pointer ${FOCUS_RING}`}
    >
      {t('welcome.recentAttempts.viewAll')}
      <ArrowRight className="w-4 h-4" />
    </button>
  );

  return (
    <Section id="recent-attempts-title" title={t('welcome.recentAttempts.title')} action={viewAll} padding={recentAttempts.length ? 'list' : 'normal'} className={className}>
      {recentAttempts.length === 0 ? (
        <p className="my-auto text-sm text-content-secondary">{t('welcome.recentAttempts.empty')}</p>
      ) : (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-1 gap-x-2">
          {recentAttempts.map((attempt, idx) => (
            <RecentAttemptRow key={attempt.id} attempt={attempt} delta={findDelta(attempt, recentAttempts.slice(idx + 1))} onLoadAttempt={onLoadAttempt} />
          ))}
        </ul>
      )}
    </Section>
  );
}
