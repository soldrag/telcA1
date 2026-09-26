import React from 'react';
import { QuestionFlagButton } from '../exam/QuestionFlag.jsx';
import Teil3NoticeCard from './Teil3NoticeCard.jsx';
import TaskBinaryOptions from '../parts/TaskBinaryOptions.jsx';

export default function Teil3QuestionCard({
  question,
  currentAnswer,
  isSubmitted,
  onSelectAnswer,
}) {
  return (
    <section
      id={`question-${question.id}`}
      aria-label={`${question.question_number}. ${question.title || 'Hinweisschild'}`}
      className="scroll-mt-24 bg-surface-card rounded-2xl border border-border-default overflow-hidden grid grid-cols-1 lg:grid-cols-2 lg:divide-x lg:divide-border-default"
    >
      <Teil3NoticeCard
        contextHeader={question.context_header}
        contextBody={question.context_body}
      />

      <div className="p-4 sm:p-6 flex flex-col justify-center gap-4">
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
    </section>
  );
}
