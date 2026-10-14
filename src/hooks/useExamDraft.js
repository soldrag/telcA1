import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { localExamDraft } from '../services/storage/examDraftStorage.js';
import { buildExamDraft } from '../utils/examDraft.js';

const SAVE_DELAY_MS = 400;

/**
 * Keeps the exam in progress in storage so a reload does not lose it. `pending` is the draft found at start,
 * offered on the home screen until it is resumed, discarded or replaced. Saves are debounced while the student
 * types and flushed when the page is hidden; nothing runs when no exam is in progress.
 */
export function useExamDraft({ isInProgress, examId, session, timer, storage = localExamDraft }) {
  const [pending, setPending] = useState(() => storage.read());
  const hasAnswers = session.answeredCount > 0;
  const snapshotRef = useRef(null);
  snapshotRef.current = isInProgress && examId && hasAnswers ? buildExamDraft({ examId, session, timer }) : null;

  useEffect(() => {
    if (!snapshotRef.current) return undefined;
    const timeoutId = setTimeout(() => storage.save(snapshotRef.current), SAVE_DELAY_MS);
    return () => clearTimeout(timeoutId);
  }, [storage, session.answers, session.activeTeil, session.activeQuestionIndex, timer.isPaused, isInProgress, examId]);

  useEffect(() => {
    const flush = () => { if (snapshotRef.current) storage.save(snapshotRef.current); };
    window.addEventListener('pagehide', flush);
    return () => window.removeEventListener('pagehide', flush);
  }, [storage]);

  const clear = useCallback(() => {
    storage.clear();
    setPending(null);
  }, [storage]);

  return useMemo(() => ({ pending, clear }), [pending, clear]);
}
