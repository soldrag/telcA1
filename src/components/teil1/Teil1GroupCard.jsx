import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Teil1TextCard from './Teil1TextCard.jsx';
import Teil1QuestionItem from './Teil1QuestionItem.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';

// Phones only: once the reader has answered, a long text can fold away so the questions fit on screen.
function TextToggle({ isCollapsed, onToggle }) {
  const { t } = useI18n();
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={!isCollapsed}
      className="sm:hidden ml-auto min-h-[2.75rem] px-2 -mr-2 flex items-center gap-1 text-sm text-action-primary cursor-pointer shrink-0"
    >
      {isCollapsed ? t('exam.showText') : t('exam.collapseText')}
      <ChevronDown className={`w-4 h-4 transition-transform ${isCollapsed ? '' : 'rotate-180'}`} aria-hidden="true" />
    </button>
  );
}

export default function Teil1GroupCard({
  group,
  groupIndex,
  answers,
  isSubmitted,
  onSelectAnswer,
}) {
  const [isTextCollapsed, setTextCollapsed] = useState(false);
  const hasAnswer = group.items.some((question) => answers[question.id]);

  return (
    <section
      aria-label={`Text ${groupIndex + 1}`}
      className="bg-surface-card rounded-2xl border border-border-default overflow-hidden"
    >
      <div className="border-b border-border-default px-4 sm:px-6 py-3 flex items-center gap-3">
        <span className="text-sm font-semibold text-content-secondary shrink-0">Text {groupIndex + 1}</span>
        {group.title && <h3 lang="de" className="text-base font-semibold text-content-primary min-w-0 truncate">{group.title}</h3>}
        {hasAnswer && <TextToggle isCollapsed={isTextCollapsed} onToggle={() => setTextCollapsed((value) => !value)} />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 lg:divide-x lg:divide-border-default items-start">
        <Teil1TextCard headerText={group.header} bodyText={group.body} isCollapsed={isTextCollapsed} />

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
