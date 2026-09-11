import React from 'react';

export default function TaskOptionList({ options, selectedAnswer, isSubmitted, onSelectAnswer, questionId }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
      {options.map((option) => {
        const isChecked = selectedAnswer.toLowerCase() === option.id.toLowerCase();
        return (
          <button
            key={option.id}
            type="button"
            disabled={isSubmitted}
            onClick={() => onSelectAnswer(questionId, option.id)}
            className={`p-4 rounded-xl border-2 text-left transition-all flex items-center space-x-3 min-h-[48px] cursor-pointer active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 ${
              isChecked
                ? 'border-action-primary bg-action-primary-subtle text-action-primary font-black shadow-sm ring-2 ring-action-primary/30'
                : 'border-border-default bg-surface-card hover:border-border-strong hover:bg-surface-raised text-content-primary font-bold shadow-xs'
            }`}
          >
            <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black uppercase flex-shrink-0 ${
              isChecked ? 'bg-action-primary text-white shadow-xs' : 'bg-surface-inset text-content-secondary border border-border-default'
            }`}>
              {option.id}
            </span>
            <span className="text-sm sm:text-base leading-snug">{option.title || option.text}</span>
          </button>
        );
      })}
    </div>
  );
}
