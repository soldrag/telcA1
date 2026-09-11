import React from 'react';
import { Globe } from 'lucide-react';
import Teil2WebpageOption from './teil2/Teil2WebpageOption.jsx';

function Teil2Banner() {
  return (
    <div className="bg-surface-card border-l-4 border-action-primary rounded-r-2xl p-5 shadow-sm border-y border-r border-border-default">
      <div className="flex items-start space-x-4">
        <div className="p-3 bg-action-primary-subtle text-action-primary rounded-xl mt-0.5 border border-action-primary-border shadow-xs">
          <Globe className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-black uppercase tracking-wider text-action-primary bg-action-primary-subtle px-3 py-1 rounded border border-action-primary-border">
              Leseverstehen • Teil 2
            </span>
            <span className="text-xs text-content-tertiary font-bold">Aufgaben 6–10</span>
          </div>
          <h2 className="text-base sm:text-xl font-black text-content-primary mt-1">
            Informationen im Internet und Kleinanzeigen
          </h2>
          <p className="text-sm text-content-secondary mt-1 font-medium leading-normal">
            Lesen Sie die Situation und die beiden Webseiten. Welche Webseite passt am besten?
            Wählen Sie <strong className="text-action-primary font-black">a</strong> oder{' '}
            <strong className="text-action-primary font-black">b</strong>.
          </p>
          <p className="text-xs text-content-tertiary mt-0.5">
            Прочитайте ситуацию и обе веб-страницы. Выберите подходящую страницу: a или b.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Teil2({
  questions = [],
  answers = {},
  onSelectAnswer,
  isSubmitted,
}) {
  return (
    <div className="space-y-8">
      <Teil2Banner />

      <div className="space-y-8">
        {questions.map((question) => {
          const currentAnswer = answers[question.id];
          const options = question.options_json || [];
          const isAnswered = Boolean(currentAnswer);

          return (
            <div
              key={question.id}
              id={`question-${question.id}`}
              className="bg-surface-card rounded-3xl border-2 border-border-default overflow-hidden shadow-md"
            >
              <div className="bg-surface-inset border-b-2 border-border-default p-4 sm:p-6">
                <div className="flex items-start space-x-4">
                  <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-action-primary text-white font-black text-sm flex items-center justify-center shadow-sm mt-0.5">
                    {question.question_number}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-action-primary bg-surface-card px-3 py-1 rounded border border-border-default shadow-xs">
                        Situation {question.question_number}
                      </span>
                      {isAnswered && (
                        <span className="text-xs font-extrabold text-action-primary bg-action-primary-subtle px-3 py-1 rounded-full border border-action-primary-border shadow-xs">
                          Выбрано: {String(currentAnswer).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <p className="text-base sm:text-lg font-bold text-content-primary mt-2 leading-snug">
                      {question.situation}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                {options.map((option) => (
                  <Teil2WebpageOption
                    key={option.id}
                    option={option}
                    isSelected={currentAnswer === option.id}
                    isSubmitted={isSubmitted}
                    onSelect={(selectedValue) => onSelectAnswer(question.id, selectedValue)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
