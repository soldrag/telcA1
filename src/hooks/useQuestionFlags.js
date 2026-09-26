import { useCallback, useState } from 'react';

// "Come back later" marks, like pencil ticks on a paper answer sheet. They never affect scoring.
export function useQuestionFlags() {
  const [flags, setFlags] = useState({});

  const toggleFlag = useCallback((questionId) => {
    setFlags((prev) => {
      const next = { ...prev };
      if (next[questionId]) delete next[questionId];
      else next[questionId] = true;
      return next;
    });
  }, []);

  const clearFlags = useCallback(() => setFlags({}), []);

  return { flags, toggleFlag, clearFlags };
}
