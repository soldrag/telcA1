import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'telc_exam_font';
const CHANGE_EVENT = 'telc-exam-font-change';
const LEVELS = new Set(['normal', 'large', 'xlarge']);

function readStoredLevel() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return LEVELS.has(stored) ? stored : 'normal';
  } catch {
    return 'normal';
  }
}

// One level for the whole exam: applied as a root data attribute that the .exam-text classes read.
export function useExamFontSize() {
  const [fontSizeLevel, setLevel] = useState(readStoredLevel);

  useEffect(() => {
    document.documentElement.dataset.examFont = fontSizeLevel;
  }, [fontSizeLevel]);

  useEffect(() => {
    const syncLevel = (event) => setLevel(event.detail);
    window.addEventListener(CHANGE_EVENT, syncLevel);
    return () => window.removeEventListener(CHANGE_EVENT, syncLevel);
  }, []);

  const selectFontSizeLevel = useCallback((level) => {
    if (!LEVELS.has(level)) return;
    try { localStorage.setItem(STORAGE_KEY, level); } catch { /* private mode: keep in memory */ }
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: level }));
  }, []);

  return { fontSizeLevel, selectFontSizeLevel };
}
