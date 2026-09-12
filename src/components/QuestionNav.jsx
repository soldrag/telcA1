import React from 'react';
import { useI18n } from '../i18n/I18nContext.jsx';
import { getTeilGroups } from '../config/teilStructureConfig.js';

function resolveQuestionBadgeClass({ isAnswered, isCorrect, hasResults, isCurrent }) {
  if (hasResults) {
    const success = 'bg-state-success text-white border-2 border-state-success-hover font-black shadow-xs';
    const error = 'bg-state-error text-white border-2 border-state-error-hover font-black shadow-xs';
    return isCorrect ? success : error;
  }
  if (isAnswered) {
    return 'bg-action-primary text-white border-2 border-action-primary-hover font-black shadow-xs';
  }
  let base = 'bg-surface-card text-content-primary border-2 border-border-default hover:border-border-strong font-bold';
  if (isCurrent) {
    base += ' ring-2 ring-action-primary ring-offset-2 scale-105 z-10 shadow-sm';
  }
  return base;
}

export default function QuestionNav({
  questions = [],
  session = {},
  results = null,
  answers = session.answers || {},
  activeTeil = session.activeTeil,
  setActiveTeil = session.selectTeil || session.setActiveTeil,
  activeQuestionIndex = session.activeQuestionIndex,
  onSelectQuestion = session.jumpToQuestion,
  testType = 'lesen',
}) {
  const { t } = useI18n();
  const resolvedType = testType || (questions[0]?.exam_id?.startsWith('schreiben-') ? 'schreiben' : 'lesen');
  const teilGroups = getTeilGroups(questions, resolvedType, t);

  return (
    <div className="bg-surface-card rounded-2xl border-2 border-border-default p-3 sm:p-4 shadow-xs space-y-4">
      <div className={`grid ${teilGroups.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-2 sm:gap-3`}>
        {teilGroups.map((group) => {
          const Icon = group.icon;
          const isSelected = activeTeil === group.teil;
          const answeredInTeil = group.questions.filter((q) => answers[q.id]).length;
          const totalInTeil = group.questions.length;

          return (
            <button
              key={group.teil}
              type="button"
              onClick={() => setActiveTeil(group.teil)}
              aria-current={isSelected ? 'step' : undefined}
              className={`flex flex-col items-center justify-center p-3 rounded-xl text-center transition-all border-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 min-w-[44px] min-h-[44px] ${
                isSelected
                  ? 'bg-action-primary-subtle border-action-primary text-action-primary shadow-xs'
                  : 'bg-surface-card hover:bg-surface-raised border-border-default text-content-primary'
              }`}
            >
              <div className="flex items-center space-x-2 mb-0.5">
                <Icon className={`w-4 h-4 ${isSelected ? 'text-action-primary stroke-[2.5]' : 'text-content-tertiary'}`} />
                <span className="text-xs sm:text-sm font-extrabold leading-tight">{group.label}</span>
              </div>
              <span className="text-xs text-content-tertiary font-semibold">{group.sublabel}</span>
              <span className="text-xs text-content-muted font-medium mt-1">
                {t('exam.partOfTotal', { current: answeredInTeil, total: totalInTeil })}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-2 overflow-x-auto px-2 py-2 scrollbar-thin">
        {questions.map((question, questionIndex) => {
          const isAnswered = Boolean(answers[question.id]);
          const isCurrent = activeQuestionIndex === questionIndex;
          const item = results?.reviewItems?.find((ri) => ri.id === question.id);
          const badgeClass = resolveQuestionBadgeClass({
            isAnswered,
            isCorrect: item?.is_correct,
            hasResults: Boolean(results),
            isCurrent: isCurrent && !results,
          });

          const buttonTitle = isAnswered
            ? t('exam.questionTooltipAnswered', { number: question.question_number, answer: answers[question.id].toUpperCase() })
            : t('exam.questionTooltipUnanswered', { number: question.question_number });

          return (
            <button
              key={question.id}
              type="button"
              onClick={() => {
                setActiveTeil(question.teil);
                onSelectQuestion(questionIndex, question.id);
              }}
              className={`flex-shrink-0 w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl text-xs sm:text-sm flex items-center justify-center transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 ${badgeClass}`}
              title={buttonTitle}
            >
              {question.question_number}
            </button>
          );
        })}
      </div>
    </div>
  );
}
