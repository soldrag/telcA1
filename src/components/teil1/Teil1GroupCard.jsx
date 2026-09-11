import React from 'react';
import { HelpCircle } from 'lucide-react';
import Teil1TextCard from './Teil1TextCard.jsx';
import Teil1QuestionItem from './Teil1QuestionItem.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function Teil1GroupCard({
  group,
  groupIndex,
  answers,
  isSubmitted,
  onSelectAnswer,
  fontSizeLevel,
  setFontSizeLevel,
}) {
  const { t } = useI18n();
  const answeredCount = group.items.filter((item) => Boolean(answers[item.id])).length;
  const totalCount = group.items.length;
  const questionNumbers = group.items.map((item) => item.question_number).join(', ');

  return (
    <div className="bg-surface-card rounded-3xl border-2 border-border-default overflow-hidden shadow-md">
      <div className="bg-surface-inset border-b-2 border-border-default px-5 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <span className="text-xs font-black uppercase tracking-wider text-white bg-telc-800 dark:bg-telc-700 px-3 py-1 rounded-lg shadow-xs">
            Text {groupIndex + 1}
          </span>
          <h3 className="text-base sm:text-lg font-black text-content-primary">
            {group.title}
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-content-secondary bg-surface-card px-3 py-1 rounded-full border border-border-default shadow-xs">
            {t('exam.part1ToQuestions')} <strong className="text-content-primary font-black">{questionNumbers}</strong>
          </span>
          <span className={`text-xs font-bold px-3 py-1 rounded-full border shadow-xs ${
            answeredCount === totalCount
              ? 'bg-state-success-subtle text-state-success-text border-state-success-border'
              : 'bg-surface-inset text-content-secondary border-border-default'
          }`}>
            {t('exam.part1Completed', { answered: answeredCount, total: totalCount })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:divide-x-2 lg:divide-border-default items-start">
        <Teil1TextCard
          headerText={group.header}
          bodyText={group.body}
          fontSizeLevel={fontSizeLevel}
          onSelectFontSizeLevel={setFontSizeLevel}
        />

        <div className="lg:col-span-5 p-5 sm:p-6 bg-surface-card flex flex-col justify-between space-y-5">
          <div className="space-y-5">
            <div className="text-xs font-black uppercase tracking-wider text-content-secondary pb-2 border-b-2 border-border-default flex items-center justify-between">
              <span className="text-sm font-black text-content-primary">
                {t('exam.part1TasksForText', { number: groupIndex + 1 })}
              </span>
              <span className="text-xs font-bold text-action-primary bg-action-primary-subtle px-3 py-1 rounded border border-action-primary-border">
                {t('exam.part1Instructions')}
              </span>
            </div>

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

          <div className="bg-state-info-subtle border border-state-info-border text-state-info-text text-xs sm:text-sm font-medium rounded-xl p-3 flex items-center justify-center space-x-2 shadow-xs">
            <HelpCircle className="w-4 h-4 text-state-info flex-shrink-0" />
            <span>{t('exam.part1Tip')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
