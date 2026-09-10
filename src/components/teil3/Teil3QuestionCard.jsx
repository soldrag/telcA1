import React from 'react';
import { Check, X } from 'lucide-react';
import Teil3NoticeCard from './Teil3NoticeCard.jsx';

function Teil3CardHeader({ questionNumber, title, isAnswered, currentAnswer }) {
  return (
    <div className="bg-surface-inset px-5 sm:px-6 py-4 border-b-2 border-border-default flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <span className="w-8 h-8 rounded-xl bg-telc-800 dark:bg-telc-700 text-white font-black text-sm flex items-center justify-center shadow-sm">
          {questionNumber}
        </span>
        <span className="text-sm font-black text-content-primary uppercase tracking-wide">
          {title || `Aufgabe ${questionNumber}`}
        </span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-xs font-extrabold text-content-secondary bg-surface-card px-3 py-1 rounded-full border border-border-default shadow-xs">
          Hinweisschild
        </span>
        {isAnswered && (
          <span className={`text-xs font-extrabold px-3 py-1 rounded-full border shadow-xs ${
            currentAnswer === 'richtig'
              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
              : 'bg-rose-100 dark:bg-rose-950/80 text-rose-900 dark:text-rose-300 border-rose-300 dark:border-rose-800'
          }`}>
            {currentAnswer === 'richtig' ? '✓ Richtig (+)' : '✕ Falsch (-)'}
          </span>
        )}
      </div>
    </div>
  );
}

function Teil3CardActions({ questionId, currentAnswer, isSubmitted, onSelectAnswer }) {
  return (
    <div className="grid grid-cols-2 gap-3 flex-shrink-0 w-full sm:w-auto">
      <button
        type="button"
        onClick={() => onSelectAnswer(questionId, 'richtig')}
        disabled={isSubmitted}
        className={`focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 flex items-center justify-center space-x-2 py-3 px-5 rounded-xl text-sm sm:text-base font-extrabold transition-all border-2 min-h-[48px] cursor-pointer active:scale-[0.98] ${
          currentAnswer === 'richtig'
            ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-md shadow-emerald-600/30 ring-2 ring-emerald-400/50 scale-[1.01]'
            : 'bg-surface-card hover:bg-emerald-50/50 dark:hover:bg-emerald-950/40 text-content-primary hover:text-emerald-900 dark:hover:text-emerald-200 border-border-default hover:border-emerald-500 shadow-xs'
        }`}
      >
        <Check className={`w-5 h-5 stroke-[2.5] ${currentAnswer === 'richtig' ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`} />
        <span>Richtig (+)</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectAnswer(questionId, 'falsch')}
        disabled={isSubmitted}
        className={`focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 flex items-center justify-center space-x-2 py-3 px-5 rounded-xl text-sm sm:text-base font-extrabold transition-all border-2 min-h-[48px] cursor-pointer active:scale-[0.98] ${
          currentAnswer === 'falsch'
            ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-700 shadow-md shadow-rose-600/30 ring-2 ring-rose-400/50 scale-[1.01]'
            : 'bg-surface-card hover:bg-rose-50/50 dark:hover:bg-rose-950/40 text-content-primary hover:text-rose-900 dark:hover:text-rose-200 border-border-default hover:border-rose-500 shadow-xs'
        }`}
      >
        <X className={`w-5 h-5 stroke-[2.5] ${currentAnswer === 'falsch' ? 'text-white' : 'text-rose-600 dark:text-rose-400'}`} />
        <span>Falsch (-)</span>
      </button>
    </div>
  );
}

export default function Teil3QuestionCard({
  question,
  currentAnswer,
  isSubmitted,
  onSelectAnswer,
}) {
  const isAnswered = Boolean(currentAnswer);

  return (
    <div
      id={`question-${question.id}`}
      className="bg-surface-card rounded-3xl border-2 border-border-default overflow-hidden shadow-md"
    >
      <Teil3CardHeader
        questionNumber={question.question_number}
        title={question.title}
        isAnswered={isAnswered}
        currentAnswer={currentAnswer}
      />

      <Teil3NoticeCard
        contextHeader={question.context_header}
        contextBody={question.context_body}
      />

      <div className="p-4 sm:p-6 border-t-2 border-border-default bg-surface-card flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-start space-x-3 flex-1">
          <span className="text-xs font-black uppercase tracking-wider text-telc-800 dark:text-telc-300 bg-telc-50 dark:bg-telc-950/60 px-3 py-1 rounded border border-telc-200 dark:border-telc-800 mt-1 flex-shrink-0">
            Aussage:
          </span>
          <p className="text-base sm:text-lg font-bold text-content-primary leading-snug">
            {question.statement}
          </p>
        </div>

        <Teil3CardActions
          questionId={question.id}
          currentAnswer={currentAnswer}
          isSubmitted={isSubmitted}
          onSelectAnswer={onSelectAnswer}
        />
      </div>
    </div>
  );
}
