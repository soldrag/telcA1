import React from 'react';
import ChoiceGroup from './ChoiceGroup.jsx';

export default function TaskOptionList({ options, selectedAnswer = '', isSubmitted, onSelectAnswer, questionId, ariaLabel }) {
  const choices = options.map((option) => ({
    value: option.id.toLowerCase(),
    label: option.title || option.text,
    marker: option.id,
  }));

  return (
    <ChoiceGroup
      options={choices}
      value={String(selectedAnswer).toLowerCase()}
      onChange={(choiceValue) => onSelectAnswer(questionId, options.find((o) => o.id.toLowerCase() === choiceValue).id)}
      disabled={isSubmitted}
      ariaLabel={ariaLabel}
      className="grid grid-cols-1 sm:grid-cols-3 gap-2"
    />
  );
}
