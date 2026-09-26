import React from 'react';
import TeilBreakdownGrid from './TeilBreakdownGrid.jsx';
import ScoreThresholdBar from './ScoreThresholdBar.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { getTestTypeById } from '../../../shared/testTypes.js';
import { formatExamName } from '../../utils/examFormat.js';
import { formatPoints } from '../../utils/formatPoints.js';

function formatDuration(totalSeconds = 0) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(Math.floor(totalSeconds % 60)).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function resolveScoreFacts(results) {
  const module = getTestTypeById(results.exam?.test_type || 'lesen');
  const maxScore = results.maxScore || module.maxScore;
  const passScore = results.passScore || module.passScore;
  const passed = results.passed ?? results.score >= passScore;
  return { module, maxScore, passScore, passed };
}

// Phones put the status next to the score; from 1024 px it heads the threshold bar.
function StatusText({ passed, className, text }) {
  return <p className={`font-semibold ${passed ? 'text-state-success-text' : 'text-state-error-text'} ${className}`}>{text}</p>;
}

/**
 * Result header: total score, pass status with the threshold bar, per-Teil points and the main actions.
 */
export default function ResultsHeroCard({ results, actions = null, teilChipsFromLg = false }) {
  const { t, language } = useI18n();
  const { module, maxScore, passScore, passed } = resolveScoreFacts(results);
  const examName = formatExamName(results.exam?.id || results.exam?.title);
  const statusKey = passed ? 'results.hero.passed' : 'results.hero.failed';

  return (
    <section aria-labelledby="results-score" className="rounded-2xl bg-surface-card border border-border-default p-4 sm:p-6 space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-end gap-3 lg:gap-8">
        <div className="space-y-1 shrink-0">
          <p lang="de" className="text-sm text-content-muted">
            {module.title} · {examName} · {formatDuration(results.timeSpentSeconds)}
          </p>
          <div className="flex items-baseline justify-between gap-3">
            <p id="results-score" className="text-5xl font-bold tracking-tight text-content-primary leading-none tabular-nums">
              {formatPoints(results.score, language)}
              <span className="text-2xl font-semibold text-content-muted"> / {maxScore}</span>
            </p>
            <StatusText passed={passed} className="lg:hidden text-sm text-right" text={t(statusKey, { pass: passScore, max: maxScore })} />
          </div>
        </div>
        <div className="flex-1 min-w-0 space-y-2 lg:pb-1">
          <StatusText passed={passed} className="hidden lg:block text-base" text={t(statusKey, { pass: passScore, max: maxScore })} />
          <ScoreThresholdBar
            score={Number(results.score) || 0}
            passScore={passScore}
            maxScore={maxScore}
            passed={passed}
            label={t('results.hero.barLabel', { pass: passScore, max: maxScore })}
          />
        </div>
        {actions && <div className="lg:shrink-0">{actions}</div>}
      </div>
      <div className={teilChipsFromLg ? 'max-lg:hidden' : ''}>
        <TeilBreakdownGrid teilBreakdown={results.teilBreakdown} testType={module.id} language={language} />
      </div>
    </section>
  );
}
