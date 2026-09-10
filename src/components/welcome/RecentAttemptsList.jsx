import React from 'react';
import { History, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import { formatExamName } from '../../utils/examFormat.js';

export default function RecentAttemptsList({
  recentAttempts = [],
  onOpenHistory,
  onLoadAttempt,
}) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
      <RecentAttemptsHeader onOpenHistory={onOpenHistory} />
      {recentAttempts.length === 0 ? (
        <RecentAttemptsEmpty />
      ) : (
        <div className="space-y-2">
          {recentAttempts.map((attempt) => (
            <RecentAttemptRow
              key={attempt.id}
              attempt={attempt}
              onLoadAttempt={onLoadAttempt}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RecentAttemptsHeader({ onOpenHistory }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <div className="p-2 bg-slate-100 text-slate-700 rounded-xl">
          <History className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">
            История ваших прохождений
          </h2>
          <p className="text-xs text-slate-500">
            Привязана к вашему браузеру
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onOpenHistory}
        className="text-xs sm:text-sm font-bold text-telc-600 hover:text-telc-700 flex items-center space-x-1 min-h-[44px] focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2"
      >
        <span>Вся история</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function RecentAttemptsEmpty() {
  return (
    <div className="text-center py-6 text-slate-400 text-xs sm:text-sm bg-slate-50 rounded-2xl border border-dashed border-slate-200">
      Вы ещё не проходили тесты на этом устройстве. Запустите случайный тест выше!
    </div>
  );
}

function RecentAttemptRow({ attempt, onLoadAttempt }) {
  const minutes = Math.floor(attempt.time_spent_seconds / 60);
  const seconds = attempt.time_spent_seconds % 60;
  const formattedDate = new Date(attempt.created_at + 'Z').toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <button
      type="button"
      onClick={() => onLoadAttempt(attempt.id)}
      className="w-full p-3 rounded-xl border border-slate-200 hover:border-telc-400 hover:bg-telc-50/40 transition-all cursor-pointer flex items-center justify-between gap-3 group min-h-[44px] focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2"
    >
      <div className="flex items-center space-x-3">
        {attempt.passed ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
        ) : (
          <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
        )}

        <div className="text-left">
          <div className="flex items-center space-x-2">
            <span className="text-xs sm:text-sm font-bold text-slate-900">
              {formatExamName(attempt.exam_id || attempt.exam_title)}
            </span>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
              attempt.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}>
              {attempt.passed ? 'Сдано' : 'Не сдано'}
            </span>
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            {formattedDate} • {minutes}м {seconds}с
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 flex-shrink-0">
        <span className="font-extrabold text-xs sm:text-sm text-slate-900">
          {attempt.score} / {attempt.total_questions} ({attempt.percentage}%)
        </span>
        <span className="text-xs text-telc-600 group-hover:underline hidden sm:inline font-semibold">
          Разбор →
        </span>
      </div>
    </button>
  );
}
