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
    <div id={`question-${question.id}`} className="scroll-mt-24 flex flex-col gap-3 sm:max-lg:flex-row sm:max-lg:items-center sm:max-lg:gap-4">
      <p lang="de" className="flex items-start gap-3 exam-text font-semibold text-content-primary sm:max-lg:flex-1">
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
        isInline
        ariaLabel={`${question.question_number}. ${question.statement}`}
      />
    </div>
  );
}
