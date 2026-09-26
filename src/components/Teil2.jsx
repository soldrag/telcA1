import React from 'react';
import { QuestionFlagButton } from './exam/QuestionFlag.jsx';
import { Globe } from 'lucide-react';
import Teil2WebpageOption from './teil2/Teil2WebpageOption.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';

function Teil2Banner() {
  const { t } = useI18n();

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
            {t('exam.instructionsPart2')}
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
          const situationId = `situation-${question.id}`;

          return (
            <section
              key={question.id}
              id={`question-${question.id}`}
              className="scroll-mt-24 bg-surface-card rounded-2xl border border-border-default overflow-hidden"
            >
              <p id={situationId} lang="de" className="flex items-start gap-3 p-4 sm:p-6 border-b border-border-default exam-text font-semibold text-content-primary">
                <span className="shrink-0 w-7 h-7 mt-0.5 rounded-lg bg-surface-inset text-content-secondary text-sm font-semibold flex items-center justify-center">
                  {question.question_number}
                </span>
                <span className="flex-1">{question.situation}</span>
                <QuestionFlagButton questionId={question.id} />
              </p>

              <div role="radiogroup" aria-labelledby={situationId} className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </section>
          );
        })}
      </div>
    </div>
  );
}
