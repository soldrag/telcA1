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
          ? 'bg-action-primary-subtle/50 border-action-primary shadow-xs ring-1 ring-action-primary/20'
          : 'bg-surface-card border-border-default hover:border-border-strong shadow-xs'
      }`}
    >
      <div className="flex items-start space-x-3">
        <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-action-primary text-white font-black text-sm flex items-center justify-center shadow-sm mt-0.5">
          {question.question_number}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-action-primary bg-action-primary-subtle px-3 py-1 rounded border border-action-primary-border">
              Aufgabe {question.question_number}
            </span>
            {isAnswered && (
              <span className={`text-xs font-extrabold px-3 py-1 rounded-full border shadow-xs flex items-center space-x-1 ${
                currentAnswer === 'richtig'
                  ? 'bg-state-success-subtle text-state-success-text border-state-success-border'
                  : 'bg-state-error-subtle text-state-error-text border-state-error-border'
              }`}>
                <span>{currentAnswer === 'richtig' ? '✓ Richtig (+)' : '✕ Falsch (-)'}</span>
              </span>
            )}
          </div>
          <p className="text-base sm:text-lg font-bold text-content-primary leading-snug mt-2">
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
              ? 'bg-state-success hover:bg-state-success-hover text-white border-state-success-hover shadow-md shadow-state-success/30 ring-2 ring-state-success/40 scale-[1.01]'
              : 'bg-surface-card hover:bg-state-success-subtle text-content-primary hover:text-state-success-text border-border-default hover:border-state-success shadow-xs'
          }`}
        >
          <Check className={`w-5 h-5 stroke-[2.5] ${currentAnswer === 'richtig' ? 'text-white' : 'text-state-success'}`} />
          <span>Richtig (+)</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectAnswer(question.id, 'falsch')}
          disabled={isSubmitted}
          className={`focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm sm:text-base font-extrabold transition-all border-2 min-h-[48px] cursor-pointer active:scale-[0.98] ${
            currentAnswer === 'falsch'
              ? 'bg-state-error hover:bg-state-error-hover text-white border-state-error-hover shadow-md shadow-state-error/30 ring-2 ring-state-error/40 scale-[1.01]'
              : 'bg-surface-card hover:bg-state-error-subtle text-content-primary hover:text-state-error-text border-border-default hover:border-state-error shadow-xs'
          }`}
        >
          <X className={`w-5 h-5 stroke-[2.5] ${currentAnswer === 'falsch' ? 'text-white' : 'text-state-error'}`} />
          <span>Falsch (-)</span>
        </button>
      </div>
    </div>
  );
}
