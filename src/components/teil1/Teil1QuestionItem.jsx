import React from 'react';
import { QuestionFlagButton } from '../exam/QuestionFlag.jsx';
import TaskBinaryOptions from '../parts/TaskBinaryOptions.jsx';

export default function Teil1QuestionItem({
  question,
  currentAnswer,
  isSubmitted,
  onSelectAnswer,
}) {
  return (
    <div id={`question-${question.id}`} className="scroll-mt-24 space-y-3">
      <p lang="de" className="flex items-start gap-3 exam-text font-semibold text-content-primary">
        <span className="shrink-0 w-7 h-7 mt-0.5 rounded-lg bg-surface-inset text-content-secondary text-sm font-semibold flex items-center justify-center">
          {question.question_number}
        </span>
        <span className="flex-1">{question.statement}</span>
        <QuestionFlagButton questionId={question.id} />
      </p>
      <TaskBinaryOptions
        questionId={question.id}
        selectedAnswer={currentAnswer}
        isSubmitted={isSubmitted}
        onSelectAnswer={onSelectAnswer}
        ariaLabel={`${question.question_number}. ${question.statement}`}
      />
    </div>
  );
}
