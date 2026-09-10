import React from 'react';
import { Play, Shuffle } from 'lucide-react';

export default function RandomExamCard({
  onStartRandomExam,
  attemptsCount = 0,
  moduleInfo = {},
}) {
  const {
    title: moduleTitle = 'Lesen',
    timeLimitMinutes = 25,
    passScore = 9,
    totalQuestions = 15,
  } = moduleInfo;

  return (
    <div className="bg-surface-card rounded-3xl border-2 border-telc-500/30 p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-telc-100 dark:bg-telc-950/80 text-telc-800 dark:text-telc-200">
            <Shuffle className="w-3.5 h-3.5 text-telc-600 dark:text-telc-400" />
            <span>Умный балансировщик вариантов</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-content-primary">
            Случайный вариант telc A1 {moduleTitle}
          </h2>

          <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
            Каждое нажатие запускает вариант, который вы ещё не проходили или решали реже остальных. Когда круг завершится, варианты продолжат равномерно чередоваться.
          </p>
        </div>

        <div className="bg-surface-inset border border-border-default rounded-2xl p-3 sm:text-right flex-shrink-0">
          <div className="text-xs font-bold uppercase tracking-wider text-content-muted">
            Ваш прогресс
          </div>
          <div className="text-lg font-black text-telc-700 dark:text-telc-300 mt-0.5">
            {attemptsCount} {attemptsCount === 1 ? 'попытка' : attemptsCount < 5 && attemptsCount > 1 ? 'попытки' : 'попыток'}
          </div>
        </div>
      </div>

      <div className="bg-surface-inset rounded-2xl p-4 sm:p-5 border border-border-default flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-content-tertiary">
            Формат раздела {moduleTitle}
          </div>
          <div className="text-sm font-semibold text-content-primary">
            {totalQuestions} заданий • {timeLimitMinutes}:00 минут • Порог сдачи: {passScore} из {totalQuestions} (60%)
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto shrink-0">
          <button
            type="button"
            onClick={() => onStartRandomExam({ timed: false })}
            className="px-4 py-3 rounded-xl border border-border-default bg-surface-card hover:bg-slate-100 dark:hover:bg-slate-700 text-content-primary text-xs sm:text-sm font-bold transition-all text-center min-h-[44px] whitespace-nowrap focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2"
          >
            Тренировка (без таймера)
          </button>

          <button
            type="button"
            onClick={() => onStartRandomExam({ timed: true })}
            className="px-6 py-3 rounded-xl bg-telc-600 hover:bg-telc-700 text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-telc-600/30 hover:scale-[1.02] transition-all flex items-center justify-center space-x-2 min-h-[44px] whitespace-nowrap focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2"
          >
            <Play className="w-4 h-4 fill-current shrink-0" />
            <span className="whitespace-nowrap">Начать ({timeLimitMinutes} мин)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
