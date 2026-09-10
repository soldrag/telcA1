import React from 'react';
import { Globe } from 'lucide-react';
import Teil2WebpageOption from './teil2/Teil2WebpageOption.jsx';

function Teil2Banner() {
  return (
    <div className="bg-surface-card border-l-4 border-telc-600 rounded-r-2xl p-4 shadow-sm border-y border-r border-border-default">
      <div className="flex items-start space-x-4">
        <div className="p-3 bg-telc-50 dark:bg-telc-950/60 text-telc-700 dark:text-telc-300 rounded-xl mt-0.5 border border-telc-200 dark:border-telc-800 shadow-xs">
          <Globe className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-black uppercase tracking-wider text-telc-700 dark:text-telc-300 bg-telc-50 dark:bg-telc-950/60 px-3 py-1 rounded border border-telc-200 dark:border-telc-800">
              Leseverstehen • Teil 2
            </span>
            <span className="text-xs text-content-tertiary font-bold">Aufgaben 6–10</span>
          </div>
          <h2 className="text-base sm:text-xl font-black text-content-primary mt-1">
            Informationen im Internet und Kleinanzeigen
          </h2>
          <p className="text-sm text-content-secondary mt-1 font-medium leading-normal">
            Lesen Sie die Situation und die beiden Webseiten. Welche Webseite passt am besten?
            Wählen Sie <strong className="text-telc-800 dark:text-telc-300 font-black">a</strong> или{' '}
            <strong className="text-telc-800 dark:text-telc-300 font-black">b</strong>.
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
                  <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-telc-800 dark:bg-telc-700 text-white font-black text-sm flex items-center justify-center shadow-sm mt-0.5">
                    {question.question_number}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-telc-800 dark:text-telc-300 bg-surface-card px-3 py-1 rounded border border-border-default shadow-xs">
                        Situation {question.question_number}
                      </span>
                      {isAnswered && (
                        <span className="text-xs font-extrabold text-telc-800 dark:text-telc-200 bg-telc-100 dark:bg-telc-950/80 px-3 py-1 rounded-full border border-telc-300 dark:border-telc-800 shadow-xs">
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
