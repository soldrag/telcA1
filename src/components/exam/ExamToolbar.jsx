import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { EXAM_HEADER_SLOT_ID } from './examHeaderSlot.js';
import { useI18n } from '../../i18n/I18nContext.jsx';

function useHeaderSlot() {
  const [slot, setSlot] = useState(null);
  useEffect(() => { setSlot(document.getElementById(EXAM_HEADER_SLOT_ID)); }, []);
  return slot;
}

function TeilTabs({ groups, activeTeil, answers, onSelectTeil }) {
  return (
    <nav aria-label="Teile" className="hidden lg:flex items-center gap-1 min-w-0">
      {groups.map((group) => {
        const answered = group.questions.filter((q) => answers[q.id]).length;
        const isActive = group.teil === activeTeil;
        return (
          <button
            key={group.teil}
            type="button"
            onClick={() => onSelectTeil(group.teil)}
            aria-current={isActive ? 'step' : undefined}
            title={group.sublabel}
            className={`min-h-[44px] px-3 rounded-lg text-sm whitespace-nowrap transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary ${
              isActive ? 'bg-surface-inset text-content-primary font-semibold' : 'text-content-secondary hover:bg-surface-raised'
            }`}
          >
            Teil {group.teil}<span className="hidden 2xl:inline"> · {group.sublabel}</span> <span className="tabular-nums text-content-tertiary">{answered}/{group.questions.length}</span>
          </button>
        );
      })}
    </nav>
  );
}

function CurrentPosition({ activeTeil, currentQuestion, sublabel }) {
  const { t } = useI18n();
  const position = currentQuestion ? t('exam.currentQuestion', { number: currentQuestion.question_number }) : sublabel;
  return (
    <span className="lg:hidden min-w-0 truncate text-sm sm:text-base font-semibold text-content-primary">
      Teil {activeTeil} · {position}
    </span>
  );
}

export default function ExamToolbar({ groups, activeTeil, answers, onSelectTeil, currentQuestion, timerSlot }) {
  const slot = useHeaderSlot();
  if (!slot) return null;
  const activeGroup = groups.find((group) => group.teil === activeTeil);

  return createPortal(
    <>
      <CurrentPosition activeTeil={activeTeil} currentQuestion={currentQuestion} sublabel={activeGroup?.sublabel} />
      <TeilTabs groups={groups} activeTeil={activeTeil} answers={answers} onSelectTeil={onSelectTeil} />
      <div className="ml-auto flex items-center gap-2 shrink-0">
        {timerSlot}
      </div>
    </>,
    slot,
  );
}

