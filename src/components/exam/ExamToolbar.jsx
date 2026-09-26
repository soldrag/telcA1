import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { EXAM_HEADER_SLOT_ID } from './examHeaderSlot.js';
import AnswerSheetGrid from './AnswerSheetGrid.jsx';
import FontSizeControl from '../teil1/FontSizeControl.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';

function useHeaderSlot() {
  const [slot, setSlot] = useState(null);
  useEffect(() => { setSlot(document.getElementById(EXAM_HEADER_SLOT_ID)); }, []);
  return slot;
}

function TeilTabs({ groups, activeTeil, answers, onSelectTeil }) {
  return (
    <nav aria-label="Teile" className="flex items-center gap-1 min-w-0">
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
            Teil {group.teil}<span className="hidden xl:inline"> · {group.sublabel}</span> <span className="tabular-nums text-content-tertiary">{answered}/{group.questions.length}</span>
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

/**
 * Desktop navigation in the header: numbered answer strip (many short items) or Teil tabs (few long ones).
 */
function DesktopNavigation({ navMode, sheet, activeTeil, onSelectTeil, onSelectQuestion }) {
  return (
    <div className="hidden lg:flex min-w-0">
      {navMode === 'tabs'
        ? <TeilTabs groups={sheet.groups} activeTeil={activeTeil} answers={sheet.answers} onSelectTeil={onSelectTeil} />
        : <AnswerSheetGrid {...sheet} layout="strip" onSelect={onSelectQuestion} />}
    </div>
  );
}

export default function ExamToolbar({ navMode = 'strip', sheet, activeTeil, onSelectTeil, onSelectQuestion, currentQuestion, timerSlot }) {
  const slot = useHeaderSlot();
  if (!slot) return null;
  const activeGroup = sheet.groups.find((group) => group.teil === activeTeil);

  return createPortal(
    <>
      <CurrentPosition activeTeil={activeTeil} currentQuestion={currentQuestion} sublabel={activeGroup?.sublabel} />
      <DesktopNavigation navMode={navMode} sheet={sheet} activeTeil={activeTeil} onSelectTeil={onSelectTeil} onSelectQuestion={onSelectQuestion} />
      <div className="ml-auto flex items-center gap-2 shrink-0">
        {timerSlot}
        <div className="hidden lg:block"><FontSizeControl variant="cycle" /></div>
      </div>
    </>,
    slot,
  );
}
