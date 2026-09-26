import { useEffect, useMemo, useState } from 'react';
import { useVisibleQuestion } from './useVisibleQuestion.js';
import { getTeilGroups } from '../config/teilStructureConfig.js';

// A question picked by keyboard or sheet stays current until the reader scrolls on their own;
// the smooth scroll that follows the pick must not hand "current" to a neighbour.
const SCROLL_SETTLE_MS = 1000;

function usePinnedQuestion(visibleId) {
  const [pinned, setPinned] = useState(null);
  useEffect(() => {
    setPinned((prev) => (prev && Date.now() - prev.at > SCROLL_SETTLE_MS ? null : prev));
  }, [visibleId]);
  const pin = (id) => setPinned({ id: String(id), at: Date.now() });
  return { currentId: pinned?.id ?? visibleId, pin };
}

/**
 * Answer-sheet state shared by the header strip, the phone sheet and the hotkeys:
 * groups per Teil, the question in view, and jumping to a question.
 */
export function useAnswerSheet(questions, session, testType) {
  const [isSheetOpen, setSheetOpen] = useState(false);
  const groups = useMemo(() => getTeilGroups(questions, testType), [questions, testType]);
  const teilIds = questions.filter((q) => q.teil === session.activeTeil).map((q) => String(q.id));
  const { currentId, pin } = usePinnedQuestion(useVisibleQuestion(teilIds));
  const currentQuestion = questions.find((q) => String(q.id) === currentId);

  const selectQuestion = (question) => {
    setSheetOpen(false);
    pin(question.id);
    session.selectTeil(question.teil);
    session.jumpToQuestion(questions.indexOf(question), question.id);
  };

  const sheet = {
    groups,
    answers: session.answers || {},
    flags: session.flags || {},
    currentQuestionId: currentQuestion?.id,
    answered: session.answeredCount ?? 0,
    total: questions.length,
  };
  return { sheet, currentQuestion, isSheetOpen, setSheetOpen, selectQuestion };
}
