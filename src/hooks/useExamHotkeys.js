import { useEffect, useRef } from 'react';

const BINARY_KEYS = { r: 'richtig', f: 'falsch' };

function shouldIgnore(event) {
  if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return true;
  const target = event.target;
  if (target?.closest?.('input, textarea, select, [contenteditable="true"], dialog[open]')) return true;
  return Boolean(document.querySelector('dialog[open], [role="dialog"]'));
}

function resolveAnswer(question, key) {
  if (!question) return null;
  const options = Array.isArray(question.options_json) ? question.options_json : [];
  if (options.length === 0) return BINARY_KEYS[key] || null;
  return options.find((option) => String(option.id).toLowerCase() === key)?.id || null;
}

function neighbourQuestion(questions, current, step) {
  const index = current ? questions.indexOf(current) : -1;
  return questions[index + step] || null;
}

function handleKey(event, context) {
  const { questions, currentQuestion, session, maxTeile, onSelectQuestion } = context;
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  const answer = resolveAnswer(currentQuestion, key);
  if (answer) return session.selectAnswer(currentQuestion.id, answer);
  if (key === 'ArrowDown' || key === 'ArrowUp') {
    const next = neighbourQuestion(questions, currentQuestion, key === 'ArrowDown' ? 1 : -1);
    return next ? onSelectQuestion(next) : false;
  }
  if (key === 'ArrowRight' && session.activeTeil < maxTeile) return session.nextTeil(maxTeile);
  if (key === 'ArrowLeft' && session.activeTeil > 1) return session.previousTeil();
  return false;
}

/**
 * Keyboard exam control: R/F and A/B/C answer the question in view, ↑/↓ move between questions, ←/→ between Teile.
 * Typing in fields, open dialogs and submitted exams are left alone.
 */
export function useExamHotkeys(context) {
  const contextRef = useRef(context);
  contextRef.current = context;

  useEffect(() => {
    const onKeyDown = (event) => {
      if (contextRef.current.session.isSubmitted || shouldIgnore(event)) return;
      if (handleKey(event, contextRef.current) !== false) event.preventDefault();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
}
