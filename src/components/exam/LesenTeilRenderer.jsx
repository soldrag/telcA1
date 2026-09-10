import React from 'react';
import Teil1 from '../Teil1.jsx';
import Teil2 from '../Teil2.jsx';
import Teil3 from '../Teil3.jsx';

export default function LesenTeilRenderer({
  activeTeil,
  questions = [],
  session = {},
  answers = session.answers,
  onSelectAnswer = session.selectAnswer,
  isSubmitted = session.isSubmitted,
}) {
  const teilQuestions = questions.filter((question) => question.teil === activeTeil);

  if (activeTeil === 1) {
    return (
      <Teil1
        questions={teilQuestions}
        answers={answers}
        onSelectAnswer={onSelectAnswer}
        isSubmitted={isSubmitted}
      />
    );
  }

  if (activeTeil === 2) {
    return (
      <Teil2
        questions={teilQuestions}
        answers={answers}
        onSelectAnswer={onSelectAnswer}
        isSubmitted={isSubmitted}
      />
    );
  }

  return (
    <Teil3
      questions={teilQuestions}
      answers={answers}
      onSelectAnswer={onSelectAnswer}
      isSubmitted={isSubmitted}
    />
  );
}
