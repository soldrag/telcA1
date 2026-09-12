import React from 'react';
import { Play, Shuffle } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { getTestTypeById } from '../../../shared/testTypes.js';

export default function RandomExamCard({
  onStartRandomExam,
  attemptsCount = 0,
  moduleInfo = {},
}) {
  const { t } = useI18n();
  const defaultModule = getTestTypeById('lesen');
  const {
    title: moduleTitle = defaultModule.title,
    timeLimitMinutes = defaultModule.timeLimitMinutes,
    passScore = defaultModule.passScore,
    totalQuestions = defaultModule.totalQuestions,
  } = moduleInfo;

  return (
    <div className="bg-surface-card rounded-3xl border-2 border-action-primary/30 p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-action-primary-subtle text-action-primary border border-action-primary-border">
            <Shuffle className="w-3.5 h-3.5 text-action-primary" />
            <span>{t('welcome.randomCard.smartBalancerBadge')}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-content-primary">
            {t('welcome.randomCard.title')} telc A1 {moduleTitle}
          </h2>

          <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
            {t('welcome.randomCard.description')}
          </p>
        </div>

        <div className="bg-surface-inset border border-border-default rounded-2xl p-3 sm:text-right flex-shrink-0">
          <div className="text-xs font-bold uppercase tracking-wider text-content-muted">
            {t('welcome.randomCard.yourProgress')}
          </div>
          <div className="text-lg font-black text-action-primary mt-0.5">
            {t('welcome.randomCard.attemptsCount', { count: attemptsCount })}
          </div>
        </div>
      </div>

      <div className="bg-surface-inset rounded-2xl p-4 sm:p-5 border border-border-default flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-content-tertiary">
            {t('welcome.randomCard.sectionFormat', { module: moduleTitle })}
          </div>
          <div className="text-sm font-semibold text-content-primary">
            {t('welcome.randomCard.formatDetails', {
              total: totalQuestions,
              minutes: timeLimitMinutes,
              pass: passScore,
            })}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto shrink-0">
          <button
            type="button"
            onClick={() => onStartRandomExam({ timed: false })}
            className="px-4 py-3 rounded-xl border border-border-default bg-surface-card hover:bg-surface-raised text-content-primary text-xs sm:text-sm font-bold transition-all text-center min-h-[44px] whitespace-nowrap focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 cursor-pointer"
          >
            {t('welcome.randomCard.practiceNoTimer')}
          </button>

          <button
            type="button"
            onClick={() => onStartRandomExam({ timed: true })}
            className="px-6 py-3 rounded-xl bg-action-primary hover:bg-action-primary-hover text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-action-primary/30 hover:scale-[1.02] transition-all flex items-center justify-center space-x-2 min-h-[44px] whitespace-nowrap focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current shrink-0" />
            <span className="whitespace-nowrap">
              {t('welcome.randomCard.startTimed', { minutes: timeLimitMinutes })}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
