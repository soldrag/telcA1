import React from 'react';
import { Award, Clock } from 'lucide-react';
import TeilBreakdownGrid from './TeilBreakdownGrid.jsx';

export default function ResultsHeroCard({ results }) {
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
    ? 'bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900 border-emerald-500/30 shadow-emerald-950/20'
    : 'bg-gradient-to-br from-rose-900 via-slate-900 to-slate-950 border-rose-500/30 shadow-rose-950/20';

  const badgeStyle = passed ? 'bg-emerald-400 text-slate-950' : 'bg-rose-400 text-slate-950';

  return (
    <div className={`rounded-3xl border p-6 sm:p-8 text-white shadow-xl ${cardStyle}`}>
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="text-center lg:text-left space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 backdrop-blur-sm border border-white/20">
            <Award className="w-4 h-4" />
            <span>{exam?.title}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {passed ? 'BESTANDEN! (Сдано)' : 'NICHT BESTANDEN (Не сдано)'}
          </h2>

          <p className="text-sm sm:text-base text-slate-200 max-w-xl">
            {passed
              ? 'Отличный результат! Вы успешно преодолели порог 60% в части Leseverstehen экзамена telc Deutsch A1.'
              : 'К сожалению, порог в 60% (9 из 15 баллов) не достигнут. Изучите таблицу ошибок ниже, чтобы разобрать сложные моменты.'}
          </p>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2 text-xs sm:text-sm text-slate-300">
            <div className="flex items-center space-x-2 bg-black/20 px-3 py-1.5 rounded-lg border border-white/10">
              <Clock className="w-4 h-4 text-slate-300" />
              <span>Время: {minutesSpent} мин. {secondsSpent} сек. / 25 мин.</span>
            </div>
            <div className="flex items-center space-x-2 bg-black/20 px-3 py-1.5 rounded-lg border border-white/10">
              <span>Проходной балл: {passScore} из {totalQuestions} (60%)</span>
            </div>
          </div>
        </div>

        {/* Score Radial Badge */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center w-48 shadow-lg">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Итоговый балл
          </span>
          <div className="flex items-baseline space-x-1 my-1">
            <span className="text-5xl font-black text-white">{score}</span>
            <span className="text-2xl font-bold text-slate-300">/{totalQuestions}</span>
          </div>
          <div className={`mt-1 text-sm font-extrabold px-3 py-0.5 rounded-full ${badgeStyle}`}>
            {percentage}%
          </div>
        </div>
      </div>

      <TeilBreakdownGrid teilBreakdown={teilBreakdown} />
    </div>
  );
}
