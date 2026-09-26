import React from 'react';
import ChoiceGroup from './ChoiceGroup.jsx';

const BINARY_OPTIONS = [
  { value: 'richtig', label: 'Richtig', marker: '+' },
  { value: 'falsch', label: 'Falsch', marker: '−' },
];

export default function TaskBinaryOptions({ selectedAnswer = '', isSubmitted, onSelectAnswer, questionId, ariaLabel }) {
  return (
    <ChoiceGroup
      options={BINARY_OPTIONS}
      value={String(selectedAnswer).toLowerCase()}
      onChange={(choiceValue) => onSelectAnswer(questionId, choiceValue)}
      disabled={isSubmitted}
      ariaLabel={ariaLabel}
    />
  );
}
