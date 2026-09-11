import React from 'react';
import { Award, Clock } from 'lucide-react';
import TeilBreakdownGrid from './TeilBreakdownGrid.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function ResultsHeroCard({ results }) {
  const { t } = useI18n();
  const {
    score,
    totalQuestions,
    passScore,
    percentage,
    passed,
    teilBreakdown,
    timeSpentSeconds,
    exam,
  } = results;

  const minutesSpent = Math.floor((timeSpentSeconds || 0) / 60);
  const secondsSpent = (timeSpentSeconds || 0) % 60;

  const cardStyle = passed
    ? 'bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-950 border-emerald-500/40 shadow-emerald-950/20'
    : 'bg-gradient-to-br from-rose-950 via-slate-900 to-slate-950 border-rose-500/40 shadow-rose-950/20';

  const badgeStyle = passed
    ? 'bg-emerald-400 text-slate-950 font-black'
    : 'bg-rose-400 text-slate-950 font-black';

  return (
    <div className={`rounded-3xl border p-6 sm:p-8 text-white shadow-xl ${cardStyle}`}>
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="text-center lg:text-left space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 backdrop-blur-sm border border-white/20">
            <Award className="w-4 h-4" />
            <span>{exam?.title}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {passed ? t('results.passedTitle') : t('results.failedTitle')}
          </h2>

          <p className="text-sm sm:text-base text-white/80 max-w-xl">
            {passed ? t('results.passedDesc') : t('results.failedDesc')}
          </p>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2 text-xs sm:text-sm text-white/80">
            <div className="flex items-center space-x-2 bg-black/20 px-3 py-1.5 rounded-lg border border-white/10">
              <Clock className="w-4 h-4 text-white/70" />
              <span>{t('results.timeSpent', { minutes: minutesSpent, seconds: secondsSpent })}</span>
            </div>
            <div className="flex items-center space-x-2 bg-black/20 px-3 py-1.5 rounded-lg border border-white/10">
              <span>{t('results.passScoreInfo', { passScore, totalQuestions })}</span>
            </div>
          </div>
        </div>

        {/* Score Radial Badge */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center w-48 shadow-lg">
          <span className="text-xs font-bold uppercase tracking-wider text-white/70">
            {t('results.finalScore')}
          </span>
          <div className="flex items-baseline space-x-1 my-1">
            <span className="text-5xl font-black text-white">{score}</span>
            <span className="text-2xl font-bold text-white/70">/{totalQuestions}</span>
          </div>
          <div className={`mt-1 text-sm px-3 py-0.5 rounded-full ${badgeStyle}`}>
            {percentage}%
          </div>
        </div>
      </div>

      <TeilBreakdownGrid teilBreakdown={teilBreakdown} />
    </div>
  );
}
