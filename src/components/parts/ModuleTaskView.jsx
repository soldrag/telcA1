import React from 'react';
import { Volume2 } from 'lucide-react';
import TaskOptionList from './TaskOptionList.jsx';
import TaskBinaryOptions from './TaskBinaryOptions.jsx';

export default function ModuleTaskView({
  questions = [],
  sessionState = {},
  activeTeil = 1,
  answers = sessionState.answers || {},
  onSelectAnswer = sessionState.onSelectAnswer || sessionState.selectAnswer,
  isSubmitted = sessionState.isSubmitted || false,
}) {
  const teilQuestions = questions.filter((question) => question.teil === activeTeil);
  const displayQuestions = teilQuestions.length > 0 ? teilQuestions : questions;

  return (
    <div className="space-y-6">
      {displayQuestions.map((question) => {
        const selected = answers[question.id] || '';
        const hasOptions = Array.isArray(question.options_json) && question.options_json.length > 0;
        const isAnswered = Boolean(selected);

        return (
          <div
            key={question.id}
            id={`question-${question.id}`}
            className={`bg-surface-card rounded-3xl border-2 transition-all p-4 sm:p-8 shadow-sm space-y-5 ${
              isAnswered ? 'border-action-primary bg-action-primary-subtle/30' : 'border-border-default'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-action-primary bg-action-primary-subtle px-3 py-1 rounded border border-action-primary-border">
                  Aufgabe {question.question_number}
                </span>
                {question.title && (
                  <h3 className="text-xl font-black text-content-primary mt-2">
                    {question.title}
                  </h3>
                )}
                {question.situation && (
                  <p className="text-sm sm:text-base font-semibold text-content-secondary mt-1 leading-snug">
                    {question.situation}
                  </p>
                )}
              </div>
            </div>

            {question.context_body && (
              <div className="p-5 bg-surface-inset rounded-2xl border-2 border-border-default text-base sm:text-lg text-content-primary space-y-2 font-sans font-medium">
                {question.context_header && (
                  <div className="text-xs font-black uppercase tracking-wider text-action-primary flex items-center space-x-2">
                    <Volume2 className="w-4 h-4 text-action-primary" />
                    <span>{question.context_header}</span>
                  </div>
                )}
                <p className="whitespace-pre-line leading-relaxed">{question.context_body}</p>
              </div>
            )}

            {question.statement && (
              <div className="text-base sm:text-lg font-bold text-content-primary bg-action-primary-subtle p-4 rounded-xl border-2 border-action-primary-border leading-snug">
                {question.statement}
              </div>
            )}

            {hasOptions ? (
              <TaskOptionList
                options={question.options_json}
                selectedAnswer={selected}
                isSubmitted={isSubmitted}
                onSelectAnswer={onSelectAnswer}
                questionId={question.id}
              />
            ) : (
              <TaskBinaryOptions
                selectedAnswer={selected}
                isSubmitted={isSubmitted}
                onSelectAnswer={onSelectAnswer}
                questionId={question.id}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
