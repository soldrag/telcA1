import React from 'react';
import ChoiceGroup from './ChoiceGroup.jsx';

const BINARY_OPTIONS = [
  { value: 'richtig', label: 'Richtig', marker: '+', hotkey: 'R' },
  { value: 'falsch', label: 'Falsch', marker: '−', hotkey: 'F' },
];

// Inline: on portrait tablets the two buttons (110×48) sit in one row with the statement.
const INLINE_CLASS = 'grid grid-cols-2 gap-2 sm:max-lg:w-[14.25rem] sm:max-lg:shrink-0';

export default function TaskBinaryOptions({ selectedAnswer = '', isSubmitted, onSelectAnswer, questionId, ariaLabel, isInline = false }) {
  return (
    <ChoiceGroup
      options={BINARY_OPTIONS}
      value={String(selectedAnswer).toLowerCase()}
      onChange={(choiceValue) => onSelectAnswer(questionId, choiceValue)}
      disabled={isSubmitted}
      ariaLabel={ariaLabel}
      isCompact={isInline}
      {...(isInline ? { className: INLINE_CLASS } : {})}
    />
  );
}
