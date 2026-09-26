import React from 'react';
import { useI18n } from '../../../i18n/I18nContext.jsx';
import { getTeilTitles } from '../../../config/teilTitles.js';
import { formatPoints } from '../../../utils/formatPoints.js';
import Section from '../../layout/Section.jsx';

const toPercent = (ratio) => `${Math.round(Math.max(0, Math.min(1, ratio)) * 100)}%`;

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
 * «What to train next»: the average per Teil over the last attempts against the pass line, the
 * weakest Teil marked. Before the first attempt only the desktop shows it, as an empty state that
 * keeps its band whole.
 */
export default function ModuleProgressCard({ progress, testType, className = '' }) {
  const { t, language } = useI18n();
  const hasProgress = Boolean(progress && progress.teils.length > 0);
  const titles = getTeilTitles(testType);

  return (
    <Section id="module-progress-title" title={t('welcome.progress.title')} className={`${hasProgress ? '' : 'max-lg:hidden'} ${className}`} bodyClassName="gap-5">
      {hasProgress ? (
        <>
          <ul className="space-y-4">
            {progress.teils.map((entry) => (
              <TeilRow key={entry.teil} entry={entry} title={titles[entry.teil] || `Teil ${entry.teil}`} isWeakest={entry.teil === progress.weakest} passRatio={progress.passRatio} t={t} language={language} />
            ))}
          </ul>
          <p className="mt-auto text-xs text-content-secondary">{t('welcome.progress.hint')}</p>
        </>
      ) : (
        <p className="my-auto text-sm text-content-secondary">{t('welcome.progress.empty')}</p>
      )}
    </Section>
  );
}
