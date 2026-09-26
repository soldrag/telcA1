import React from 'react';
import { useI18n } from '../../../i18n/I18nContext.jsx';
import { getTeilTitles } from '../../../config/teilTitles.js';
import { formatPoints } from '../../../utils/formatPoints.js';

const toPercent = (ratio) => `${Math.round(Math.max(0, Math.min(1, ratio)) * 100)}%`;

// Last attempts as bars against the pass line: no chart library, just proportional heights.
function TrendChart({ trend, passRatio, label }) {
  return (
    <div role="img" aria-label={label} className="relative flex items-end justify-end gap-1 h-8 w-28 shrink-0">
      <span aria-hidden="true" className="absolute inset-x-0 border-t border-dashed border-content-muted" style={{ bottom: toPercent(passRatio) }} />
      {trend.map((point) => (
        <span
          key={point.id}
          className={`w-2 rounded-sm ${point.score / point.max >= passRatio ? 'bg-state-success' : 'bg-state-error'}`}
          style={{ height: toPercent(Math.max(point.score / point.max, 0.06)) }}
        />
      ))}
    </div>
  );
}

function TeilRow({ entry, title, isWeakest, passRatio, t, language }) {
  const fill = isWeakest ? 'bg-state-warning' : 'bg-action-primary';
  return (
    <li className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span lang="de" className="text-content-primary truncate">
          {title}
          {isWeakest && <span lang={language} className="ml-2 text-state-warning-text">· {t('welcome.progress.weakest')}</span>}
        </span>
        <span className="font-semibold tabular-nums text-content-primary">{formatPoints(entry.score, language)}/{formatPoints(entry.total, language)}</span>
      </div>
      <div className="relative h-2 rounded-full bg-surface-inset">
        <div className={`h-2 rounded-full ${fill}`} style={{ width: toPercent(entry.ratio) }} />
        <span aria-hidden="true" className="absolute -top-0.5 h-3 w-0.5 rounded bg-content-secondary" style={{ left: toPercent(passRatio) }} />
      </div>
    </li>
  );
}

/**
 * «What to train next»: the average per Teil over the last attempts, the weakest Teil marked,
 * and the latest totals as a small trend. Hidden until the module has an attempt.
 */
export default function ModuleProgressCard({ progress, testType }) {
  const { t, language } = useI18n();
  if (!progress || progress.teils.length === 0) return null;
  const titles = getTeilTitles(testType);
  const trendLabel = t('welcome.progress.chartAria', { list: progress.trend.map((point) => formatPoints(point.score, language)).join(', ') });

  return (
    <section aria-labelledby="module-progress-title" className="rounded-2xl bg-surface-card border border-border-default p-4 sm:p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-0.5">
          <h2 id="module-progress-title" className="text-base font-semibold text-content-primary">{t('welcome.progress.title')}</h2>
          <p className="text-xs text-content-secondary">{t('welcome.progress.hint')}</p>
        </div>
        {progress.trend.length > 1 && <TrendChart trend={progress.trend} passRatio={progress.passRatio} label={trendLabel} />}
      </div>
      <ul className="space-y-3">
        {progress.teils.map((entry) => (
          <TeilRow key={entry.teil} entry={entry} title={titles[entry.teil] || `Teil ${entry.teil}`} isWeakest={entry.teil === progress.weakest} passRatio={progress.passRatio} t={t} language={language} />
        ))}
      </ul>
    </section>
  );
}
