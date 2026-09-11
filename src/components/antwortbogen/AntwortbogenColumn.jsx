import React from 'react';

function getChoicePillClass(isSelected, review) {
  if (!isSelected) {
    return 'bg-surface-card text-content-muted border-border-default';
  }
  if (!review) {
    return 'bg-content-primary text-canvas border-content-primary shadow-xs';
  }
  if (review.is_correct) {
    return 'bg-state-success text-white border-state-success-hover shadow-xs';
  }
  return 'bg-state-error text-white border-state-error-hover shadow-xs';
}

export default function AntwortbogenColumn({
  headerInfo = {},
  data = {},
  config = {},
  onSelectQuestion,
  // Backwards compatibility fallbacks
  title = headerInfo.title,
  subtitle = headerInfo.subtitle,
  questions = data.questions || [],
  answers = data.answers || {},
  results = data.results || null,
  options = config.options || ['richtig', 'falsch'],
  labels = config.labels || ['+', '-'],
}) {
  return (
    <div className="border border-border-subtle rounded-xl p-3 bg-surface-inset">
      <div className="text-xs font-bold text-content-primary border-b border-border-subtle pb-1.5 mb-2 flex justify-between">
        <span>{title}</span>
        <span className="text-xs text-content-tertiary font-mono">{subtitle}</span>
      </div>

      <div className="space-y-1.5">
        {questions.map((question) => {
          const userAnswer = answers[question.id];
          const review = results?.reviewItems?.find((reviewItem) => reviewItem.id === question.id);

          return (
            <button
              key={question.id}
              type="button"
              onClick={() => onSelectQuestion?.(question.question_number - 1, question.id)}
              className="flex items-center justify-between w-full py-1 px-2 rounded hover:bg-surface-card transition-colors cursor-pointer text-xs focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 min-w-[44px] min-h-[44px]"
            >
              <span className="font-mono font-bold text-content-secondary w-5 text-left">
                {question.question_number}.
              </span>
              <div className="flex space-x-2">
                {options.map((optionValue, optionIndex) => {
                  const isSelected = userAnswer === optionValue;
                  const pillClass = getChoicePillClass(isSelected, review);

                  return (
                    <span
                      key={optionValue}
                      className={`w-6 h-5 rounded flex items-center justify-center font-bold border transition-all ${pillClass}`}
                    >
                      {labels[optionIndex]}
                    </span>
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
