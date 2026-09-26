import React from 'react';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { formatExamName, getExamNumber } from '../../utils/examFormat.js';
import { formatDayMonth } from '../../utils/historyFormat.js';

const FOCUS_RING = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2';

function resolveStatus({ best, isAssigned, passScore, t }) {
  if (best) {
    const tone = best.score >= passScore ? 'text-state-success-text' : 'text-state-error-text';
    return { text: `${best.score}/${best.total}`, tone, showOnMobile: true };
  }
  if (isAssigned) return { text: t('welcome.variants.assigned'), tone: 'text-state-warning-text', showOnMobile: true };
  return { text: t('welcome.variants.notSolved'), tone: 'text-content-muted', showOnMobile: false, muted: true };
}

// Phones: 5×2 number squares. From 1024 px: cards with name, best score and last activity.
function VariantCell({ exam, status, activity, onStart, t, language }) {
  const name = formatExamName(exam.id);
  return (
    <button
      type="button"
      onClick={() => onStart(exam.id)}
      aria-label={`${t('welcome.variants.startAria', { name })}, ${status.text}`}
      className={`group min-h-[3.25rem] lg:min-h-[6rem] rounded-xl bg-surface-card border border-border-default hover:border-action-primary hover:ring-1 hover:ring-action-primary hover:bg-surface-raised flex flex-col items-center justify-center lg:items-start lg:justify-start lg:px-3 lg:py-3 gap-0.5 min-w-0 cursor-pointer transition-colors ${FOCUS_RING}`}
    >
      <span className="font-semibold text-content-primary">
        <span className="lg:hidden">{getExamNumber(exam.id) || name}</span>
        <span className="hidden lg:inline text-sm whitespace-nowrap">{name}</span>
      </span>
      <span className={`text-xs lg:text-lg lg:font-semibold tabular-nums ${status.tone} ${status.showOnMobile ? '' : 'hidden lg:inline'} ${status.muted ? 'lg:text-sm lg:font-normal' : ''}`}>{status.text}</span>
      <span className="hidden lg:block w-full mt-auto text-xs text-content-tertiary whitespace-nowrap">
        <span className="group-hover:hidden group-focus-visible:hidden">{activity ? t('welcome.variants.attemptsLine', { count: activity.count, date: formatDayMonth(activity.lastAt, language) }) : ''}</span>
        <span className="hidden group-hover:inline group-focus-visible:inline text-action-primary">{t('welcome.variants.startHint')}</span>
      </span>
    </button>
  );
}

export default function VariantGrid({ exams = [], scores = {}, assignedExamIds = [], passScore = 9, onStartVariant }) {
  const { t, language } = useI18n();
  if (exams.length === 0) return null;
  const { bestByExamId = {}, activityByExamId = {}, best, attemptsCount = 0 } = scores;

  return (
    <section aria-labelledby="variants-title" className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="variants-title" className="text-base font-semibold text-content-primary">{t('welcome.variants.title')}</h2>
        {best && (
          <span className="text-sm text-content-secondary tabular-nums">
            {t('welcome.variants.summary', { best: best.score, max: best.total, count: attemptsCount })}
          </span>
        )}
      </div>
      <div className={`grid grid-cols-5 lg:grid-cols-4 ${exams.length > 4 ? 'xl:grid-cols-5' : ''} gap-2 lg:gap-3`}>
        {exams.map((exam) => (
          <VariantCell
            key={exam.id}
            exam={exam}
            status={resolveStatus({ best: bestByExamId[exam.id], isAssigned: assignedExamIds.includes(exam.id), passScore, t })}
            activity={activityByExamId[exam.id]}
            onStart={onStartVariant}
            t={t}
            language={language}
          />
        ))}
      </div>
    </section>
  );
}
