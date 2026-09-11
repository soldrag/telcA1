import React from 'react';
import { Check, X } from 'lucide-react';
import Teil3NoticeCard from './Teil3NoticeCard.jsx';

function Teil3CardHeader({ questionNumber, title, isAnswered, currentAnswer }) {
  return (
    <div className="bg-surface-inset px-5 sm:px-6 py-4 border-b-2 border-border-default flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <span className="w-8 h-8 rounded-xl bg-action-primary text-white font-black text-sm flex items-center justify-center shadow-sm">
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
              ? 'bg-state-success-subtle text-state-success-text border-state-success-border'
              : 'bg-state-error-subtle text-state-error-text border-state-error-border'
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
            ? 'bg-state-success hover:bg-state-success-hover text-white border-state-success-hover shadow-md shadow-state-success/30 ring-2 ring-state-success/40 scale-[1.01]'
            : 'bg-surface-card hover:bg-state-success-subtle text-content-primary hover:text-state-success-text border-border-default hover:border-state-success shadow-xs'
        }`}
      >
        <Check className={`w-5 h-5 stroke-[2.5] ${currentAnswer === 'richtig' ? 'text-white' : 'text-state-success'}`} />
        <span>Richtig (+)</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectAnswer(questionId, 'falsch')}
        disabled={isSubmitted}
        className={`focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 flex items-center justify-center space-x-2 py-3 px-5 rounded-xl text-sm sm:text-base font-extrabold transition-all border-2 min-h-[48px] cursor-pointer active:scale-[0.98] ${
          currentAnswer === 'falsch'
            ? 'bg-state-error hover:bg-state-error-hover text-white border-state-error-hover shadow-md shadow-state-error/30 ring-2 ring-state-error/40 scale-[1.01]'
            : 'bg-surface-card hover:bg-state-error-subtle text-content-primary hover:text-state-error-text border-border-default hover:border-state-error shadow-xs'
        }`}
      >
        <X className={`w-5 h-5 stroke-[2.5] ${currentAnswer === 'falsch' ? 'text-white' : 'text-state-error'}`} />
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
          <span className="text-xs font-black uppercase tracking-wider text-action-primary bg-action-primary-subtle px-3 py-1 rounded border border-action-primary-border mt-1 flex-shrink-0">
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
