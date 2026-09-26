import React from 'react';
import { ChevronDown, Play } from 'lucide-react';
import ModuleStructureCards from './ModuleStructureCards.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { getTestTypeById } from '../../../shared/testTypes.js';

const FOCUS_RING = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2';

export function ModuleHeading({ moduleInfo = {} }) {
  const { t } = useI18n();
  const module = { ...getTestTypeById(moduleInfo.id || 'lesen'), ...moduleInfo };
  return (
    <div className="space-y-1">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-content-primary">
        {module.title} · {t(`welcome.moduleSubtitle_${module.id}`)}
      </h1>
      <p className="text-sm sm:text-base text-content-secondary">
        {t('welcome.moduleSummary', {
          parts: module.partsCount,
          total: module.totalQuestions,
          minutes: module.timeLimitMinutes,
          pass: module.passScore,
          max: module.maxScore,
        })}
      </p>
    </div>
  );
}

// Below 1024 px the structure folds under the start buttons; on desktop it is open in the side column.
function StructureDetails({ module, t }) {
  return (
    <details className="group text-sm lg:hidden">
      <summary className="list-none cursor-pointer text-content-secondary hover:text-content-primary min-h-[2.75rem] inline-flex items-center gap-1.5 [&::-webkit-details-marker]:hidden">
        {t('welcome.randomCard.structureToggle')}
        <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
      </summary>
      <p className="text-content-secondary mb-3">{t(`welcome.moduleDesc_${module.id}`)}</p>
      <ModuleStructureCards testType={module.id} />
    </details>
  );
}

export default function RandomExamCard({ onStartRandomExam, moduleInfo = {} }) {
  const { t } = useI18n();
  const module = { ...getTestTypeById(moduleInfo.id || 'lesen'), ...moduleInfo };

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onStartRandomExam({ timed: true })}
          className={`min-h-[3.25rem] px-6 rounded-xl bg-action-primary hover:bg-action-primary-hover text-white font-semibold flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer transition-colors ${FOCUS_RING}`}
        >
          <Play className="w-4 h-4 fill-current shrink-0" />
          {t('welcome.randomCard.startExam', { minutes: module.timeLimitMinutes })}
        </button>
        <button
          type="button"
          onClick={() => onStartRandomExam({ timed: false })}
          className={`min-h-[3.25rem] px-6 rounded-xl bg-surface-card border border-border-default hover:bg-surface-raised text-content-primary font-semibold whitespace-nowrap cursor-pointer transition-colors ${FOCUS_RING}`}
        >
          {t('welcome.randomCard.practice')}
        </button>
      </div>
      <p className="text-sm text-content-secondary">{t('welcome.randomCard.balancerHint')}</p>
      <StructureDetails module={module} t={t} />
    </section>
  );
}
