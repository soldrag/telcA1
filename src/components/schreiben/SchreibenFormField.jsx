import React from 'react';
import { Check } from 'lucide-react';

export default function SchreibenFormField({
  questionNumber,
  questionId,
  label,
  value = '',
  placeholder = '',
  onChange,
  disabled = false,
  isHighlighted = false,
}) {
  const isFilled = Boolean(value && value.trim());

  return (
    <div
      id={`question-${questionId}`}
      className={`p-3.5 sm:p-4 rounded-xl border-2 transition-all space-y-1.5 ${
        isHighlighted
          ? 'border-action-primary bg-action-primary-subtle/30 ring-2 ring-action-primary/30'
          : isFilled
          ? 'border-border-strong bg-surface-card'
          : 'border-border-default bg-surface-card hover:border-border-strong'
      }`}
    >
      <div className="flex items-center justify-between">
        <label
          htmlFor={`input-${questionId}`}
          className="text-xs sm:text-sm font-bold text-content-primary flex items-center space-x-2"
        >
          <span className="w-5 h-5 rounded-md bg-action-primary text-white text-xs font-black flex items-center justify-center flex-shrink-0">
            {questionNumber}
          </span>
          <span>{label}</span>
        </label>
        {isFilled && (
          <span className="text-xs font-bold text-state-success flex items-center space-x-1">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span className="hidden sm:inline">Eingetragen</span>
          </span>
        )}
      </div>

      <input
        id={`input-${questionId}`}
        type="text"
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(questionId, e.target.value)}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 rounded-lg border-2 border-border-default bg-surface-inset text-content-primary font-medium text-sm sm:text-base placeholder:text-content-muted focus:outline-none focus:border-action-primary focus:bg-surface-card transition-colors disabled:opacity-60"
      />
    </div>
  );
}
