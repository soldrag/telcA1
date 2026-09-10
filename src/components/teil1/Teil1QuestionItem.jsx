import React from 'react';
import { Check, X } from 'lucide-react';

export default function Teil1QuestionItem({
  question,
  currentAnswer,
  isSubmitted,
  onSelectAnswer,
}) {
  const isAnswered = Boolean(currentAnswer);

  return (
    <div
      id={`question-${question.id}`}
      className={`p-4 sm:p-5 rounded-2xl border-2 transition-all space-y-4 ${
        isAnswered
          ? 'bg-sky-50/40 border-telc-500 shadow-sm ring-1 ring-telc-500/20'
          : 'bg-white border-slate-300 hover:border-slate-400 shadow-xs'
      }`}
    >
      <div className="flex items-start space-x-3">
        <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-telc-800 text-white font-black text-sm flex items-center justify-center shadow-sm mt-0.5">
          {question.question_number}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-telc-800 bg-telc-50 px-3 py-1 rounded border border-telc-200">
              Aufgabe {question.question_number}
            </span>
            {isAnswered && (
              <span className={`text-xs font-extrabold px-3 py-1 rounded-full border shadow-xs flex items-center space-x-1 ${
                currentAnswer === 'richtig'
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  : 'bg-rose-100 text-rose-900 border-rose-300'
              }`}>
                <span>{currentAnswer === 'richtig' ? '✓ Richtig (+)' : '✕ Falsch (-)'}</span>
              </span>
            )}
          </div>
          <p className="text-base sm:text-lg font-bold text-slate-950 leading-snug mt-2">
            {question.statement}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          type="button"
          onClick={() => onSelectAnswer(question.id, 'richtig')}
          disabled={isSubmitted}
          className={`focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm sm:text-base font-extrabold transition-all border-2 min-h-[48px] cursor-pointer active:scale-[0.98] ${
            currentAnswer === 'richtig'
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-md shadow-emerald-600/30 ring-2 ring-emerald-400/50 scale-[1.01]'
              : 'bg-white hover:bg-emerald-50/50 text-slate-900 hover:text-emerald-900 border-slate-300 hover:border-emerald-500 shadow-xs'
          }`}
        >
          <Check className={`w-5 h-5 stroke-[2.5] ${currentAnswer === 'richtig' ? 'text-white' : 'text-emerald-600'}`} />
          <span>Richtig (+)</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectAnswer(question.id, 'falsch')}
          disabled={isSubmitted}
          className={`focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm sm:text-base font-extrabold transition-all border-2 min-h-[48px] cursor-pointer active:scale-[0.98] ${
            currentAnswer === 'falsch'
              ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-700 shadow-md shadow-rose-600/30 ring-2 ring-rose-400/50 scale-[1.01]'
              : 'bg-white hover:bg-rose-50/50 text-slate-900 hover:text-rose-900 border-slate-300 hover:border-rose-500 shadow-xs'
          }`}
        >
          <X className={`w-5 h-5 stroke-[2.5] ${currentAnswer === 'falsch' ? 'text-white' : 'text-rose-600'}`} />
          <span>Falsch (-)</span>
        </button>
      </div>
    </div>
  );
}
