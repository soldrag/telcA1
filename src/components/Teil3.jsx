import React from 'react';
import { FileText } from 'lucide-react';
import Teil3QuestionCard from './teil3/Teil3QuestionCard.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';

function Teil3Banner() {
  const { t } = useI18n();

  return (
    <div className="bg-surface-card border-l-4 border-action-primary rounded-r-2xl p-5 shadow-sm border-y border-r border-border-default">
      <div className="flex items-start space-x-4">
        <div className="p-3 bg-action-primary-subtle text-action-primary rounded-xl mt-0.5 border border-action-primary-border shadow-xs">
          <FileText className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-black uppercase tracking-wider text-action-primary bg-action-primary-subtle px-3 py-1 rounded border border-action-primary-border">
              Leseverstehen • Teil 3
            </span>
            <span className="text-xs text-content-tertiary font-bold">Aufgaben 11–15</span>
          </div>
          <h2 className="text-base sm:text-xl font-black text-content-primary mt-1">
            Hinweisschilder, Notizen und Aushänge
          </h2>
          <p className="text-sm text-content-secondary mt-1 font-medium leading-normal">
            Lesen Sie die Schilder und Mitteilungen. Ist die Aussage{' '}
            <strong className="text-state-success font-black">richtig (+)</strong> oder{' '}
            <strong className="text-state-error font-black">falsch (-)</strong>?
          </p>
          <p className="text-xs text-content-tertiary mt-0.5">
            {t('exam.instructionsPart3')}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Teil3({
  questions = [],
  answers = {},
  onSelectAnswer,
  isSubmitted,
}) {
  return (
    <div className="space-y-8">
      <Teil3Banner />

      <div className="space-y-8">
        {questions.map((question) => (
          <Teil3QuestionCard
            key={question.id}
            question={question}
            currentAnswer={answers[question.id]}
            isSubmitted={isSubmitted}
            onSelectAnswer={onSelectAnswer}
          />
        ))}
      </div>
    </div>
  );
}
