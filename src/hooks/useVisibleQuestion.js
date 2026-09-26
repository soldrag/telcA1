import { useEffect, useState } from 'react';

// Tracks which question sits in the reading zone of the viewport. Event-driven (IntersectionObserver),
// so an idle exam tab costs no CPU.
export function useVisibleQuestion(questionIds) {
  const [visibleId, setVisibleId] = useState(questionIds[0] ?? null);
  const idsKey = questionIds.join('|');

  useEffect(() => {
    setVisibleId(questionIds[0] ?? null);
    if (typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting);
      if (visible.length > 0) setVisibleId(visible[0].target.id.replace(/^question-/, ''));
    }, { rootMargin: '-35% 0px -55% 0px' });
    questionIds.forEach((id) => {
      const element = document.getElementById(`question-${id}`);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [idsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return visibleId;
}
