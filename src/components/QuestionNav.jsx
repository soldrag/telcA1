import React from 'react';
import { Mail, Globe, FileText } from 'lucide-react';

export default function QuestionNav({
  questions = [],
  session = {},
  results = null,
  answers = session.answers || {},
  activeTeil = session.activeTeil,
  setActiveTeil = session.selectTeil || session.setActiveTeil,
  activeQuestionIndex = session.activeQuestionIndex,
  onSelectQuestion = session.jumpToQuestion,
}) {
  const teilGroups = [
    { teil: 1, label: 'Teil 1 (1–5)', sublabel: 'E-Mails & Briefe', icon: Mail, questions: questions.filter(question => question.teil === 1) },
    { teil: 2, label: 'Teil 2 (6–10)', sublabel: 'Webseiten / Anzeigen', icon: Globe, questions: questions.filter(question => question.teil === 2) },
    { teil: 3, label: 'Teil 3 (11–15)', sublabel: 'Schilder & Zettel', icon: FileText, questions: questions.filter(question => question.teil === 3) },
  ];

  return (
    <div className="bg-surface-card rounded-2xl border-2 border-border-default p-3 sm:p-4 shadow-xs space-y-4">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {teilGroups.map((group) => {
          const Icon = group.icon;
          const isSelected = activeTeil === group.teil;
          const answeredInTeil = group.questions.filter(question => answers[question.id]).length;
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
                {answeredInTeil} из {totalInTeil}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-2 overflow-x-auto px-2 py-2 scrollbar-thin">
        {questions.map((question, questionIndex) => {
          const isAnswered = Boolean(answers[question.id]);
          const isCurrent = activeQuestionIndex === questionIndex;

          let badgeClass = 'bg-surface-card text-content-primary border-2 border-border-default hover:border-border-strong font-bold';
          if (results) {
            const item = results.reviewItems?.find(reviewItem => reviewItem.id === question.id);
            if (item?.is_correct) {
              badgeClass = 'bg-state-success text-white border-2 border-state-success-hover font-black shadow-xs';
            } else {
              badgeClass = 'bg-state-error text-white border-2 border-state-error-hover font-black shadow-xs';
            }
          } else if (isAnswered) {
            badgeClass = 'bg-action-primary text-white border-2 border-action-primary-hover font-black shadow-xs';
          }

          if (isCurrent && !results) {
            badgeClass += ' ring-2 ring-action-primary ring-offset-2 scale-105 z-10 shadow-sm';
          }

          return (
            <button
              key={question.id}
              type="button"
              onClick={() => {
                setActiveTeil(question.teil);
                onSelectQuestion(questionIndex, question.id);
              }}
              className={`flex-shrink-0 w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl text-xs sm:text-sm flex items-center justify-center transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 ${badgeClass}`}
              title={`Aufgabe ${question.question_number} (${isAnswered ? `Ответ: ${answers[question.id].toUpperCase()}` : 'Без ответа'})`}
            >
              {question.question_number}
            </button>
          );
        })}
      </div>
    </div>
  );
}
