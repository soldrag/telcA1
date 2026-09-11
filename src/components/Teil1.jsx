import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import Teil1GroupCard from './teil1/Teil1GroupCard.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';

function Teil1Banner() {
  const { t } = useI18n();

  return (
    <div className="bg-surface-card border-l-4 border-action-primary rounded-r-2xl p-5 shadow-sm border-y border-r border-border-default">
      <div className="flex items-start space-x-4">
        <div className="p-3 bg-action-primary-subtle text-action-primary rounded-xl mt-0.5 border border-action-primary-border shadow-xs">
          <Mail className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-black uppercase tracking-wider text-action-primary bg-action-primary-subtle px-3 py-1 rounded border border-action-primary-border">
              Leseverstehen • Teil 1
            </span>
            <span className="text-xs text-content-tertiary font-bold">Aufgaben 1–5</span>
          </div>
          <h2 className="text-base sm:text-xl font-black text-content-primary mt-1">
            E-Mails, Briefe und persönliche Mitteilungen
          </h2>
          <p className="text-sm text-content-secondary mt-1 font-medium leading-normal">
            Lesen Sie die Texte und die Aufgaben 1 bis 5. Ist die Aussage{' '}
            <strong className="text-state-success font-black">richtig (+)</strong> oder{' '}
            <strong className="text-state-error font-black">falsch (-)</strong>?
          </p>
          <p className="text-xs text-content-tertiary mt-0.5">
            {t('exam.instructionsPart1')}
          </p>
        </div>
      </div>
    </div>
  );
}

function groupQuestionsByText(questions) {
  return questions.reduce((groups, question) => {
    const groupKey = question.title || 'Text';
    if (!groups[groupKey]) {
      groups[groupKey] = {
        title: question.title,
        header: question.context_header,
        body: question.context_body,
        items: [],
      };
    }
    groups[groupKey].items.push(question);
    return groups;
  }, {});
}

export default function Teil1({
  questions = [],
  answers = {},
  onSelectAnswer,
  isSubmitted,
}) {
  const [fontSizeLevel, setFontSizeLevel] = useState('normal');
  const groupedByText = groupQuestionsByText(questions);

  return (
    <div className="space-y-8">
      <Teil1Banner />

      {Object.values(groupedByText).map((group, groupIndex) => (
        <Teil1GroupCard
          key={groupIndex}
          group={group}
          groupIndex={groupIndex}
          answers={answers}
          isSubmitted={isSubmitted}
          onSelectAnswer={onSelectAnswer}
          fontSizeLevel={fontSizeLevel}
          setFontSizeLevel={setFontSizeLevel}
        />
      ))}
    </div>
  );
}
