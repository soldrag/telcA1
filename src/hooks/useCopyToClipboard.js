import { useEffect, useRef, useState } from 'react';

const FEEDBACK_MS = 2000;

/** Copies text and reports `copied` for a short moment so the button can confirm it. */
export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const copy = async (text) => {
    if (!text) return;
    try {
      await navigator?.clipboard?.writeText?.(text);
      setCopied(true);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), FEEDBACK_MS);
    } catch {
      setCopied(false);
    }
  };

  return { copied, copy };
}
