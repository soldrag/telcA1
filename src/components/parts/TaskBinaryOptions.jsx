import React from 'react';
import { Check, X } from 'lucide-react';

export default function TaskBinaryOptions({ selectedAnswer, isSubmitted, onSelectAnswer, questionId }) {
  const binaryChoices = ['richtig', 'falsch'];

  return (
    <div className="grid grid-cols-2 gap-3 pt-1">
      {binaryChoices.map((choiceValue) => {
        const isChecked = selectedAnswer.toLowerCase() === choiceValue;
        const isRichtig = choiceValue === 'richtig';
        const checkedStyle = isRichtig
          ? 'border-state-success bg-state-success text-white shadow-md ring-2 ring-state-success/40'
          : 'border-state-error bg-state-error text-white shadow-md ring-2 ring-state-error/40';

        return (
          <button
            key={choiceValue}
            type="button"
            disabled={isSubmitted}
            onClick={() => onSelectAnswer(questionId, choiceValue)}
            className={`py-3 px-4 rounded-xl border-2 text-sm sm:text-base font-extrabold transition-all flex items-center justify-center space-x-2 min-h-[48px] cursor-pointer active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 ${
              isChecked
                ? checkedStyle
                : 'border-border-default bg-surface-card hover:border-border-strong hover:bg-surface-raised text-content-primary shadow-xs'
            }`}
          >
            {isRichtig ? (
              <Check className={`w-5 h-5 stroke-[2.5] ${isChecked ? 'text-white' : 'text-state-success'}`} />
            ) : (
              <X className={`w-5 h-5 stroke-[2.5] ${isChecked ? 'text-white' : 'text-state-error'}`} />
            )}
            <span>{isRichtig ? 'Richtig (+)' : 'Falsch (-)'}</span>
          </button>
        );
      })}
    </div>
  );
}
