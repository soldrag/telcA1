import React from 'react';
import Teil1TextCard from './Teil1TextCard.jsx';
import Teil1QuestionItem from './Teil1QuestionItem.jsx';

export default function Teil1GroupCard({
  group,
  groupIndex,
  answers,
  isSubmitted,
  onSelectAnswer,
}) {
  return (
    <section
      aria-label={`Text ${groupIndex + 1}`}
      className="bg-surface-card rounded-2xl border border-border-default overflow-hidden"
    >
      <div className="border-b border-border-default px-4 sm:px-6 py-3 flex items-baseline gap-3">
        <span className="text-sm font-semibold text-content-secondary">Text {groupIndex + 1}</span>
        {group.title && <h3 lang="de" className="text-base font-semibold text-content-primary">{group.title}</h3>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 lg:divide-x lg:divide-border-default items-start">
        <Teil1TextCard headerText={group.header} bodyText={group.body} />

        <div className="lg:col-span-5 p-4 sm:p-6 space-y-6">
          {group.items.map((question) => (
            <Teil1QuestionItem
              key={question.id}
              question={question}
              currentAnswer={answers[question.id]}
              isSubmitted={isSubmitted}
              onSelectAnswer={onSelectAnswer}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
