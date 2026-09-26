import { useEffect, useState } from 'react';

function isTextEntry(element) {
  if (!element) return false;
  if (element.tagName === 'TEXTAREA' || element.isContentEditable) return true;
  return element.tagName === 'INPUT' && !['checkbox', 'radio', 'button', 'submit'].includes(element.type);
}

/**
 * True while a text field has focus — on phones that means the soft keyboard is up,
 * so bottom bars step aside for the field's own tools (umlauts, word count).
 */
export function useTextEntryFocus() {
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const update = () => setIsTyping(isTextEntry(document.activeElement));
    document.addEventListener('focusin', update);
    document.addEventListener('focusout', update);
    return () => {
      document.removeEventListener('focusin', update);
      document.removeEventListener('focusout', update);
    };
  }, []);

  return isTyping;
}
