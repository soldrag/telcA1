import React from 'react';
import { insertAtSelection } from '../../utils/insertAtSelection.js';

const GERMAN_CHARS = ['ä', 'ö', 'ü', 'ß'];

export default function SchreibenUmlautBar({ fieldRef, value = '', onChange, disabled = false }) {
  const insertChar = (char) => {
    const field = fieldRef.current;
    if (disabled || !field) return;
    const { text, caret } = insertAtSelection(value, char, {
      start: field.selectionStart,
      end: field.selectionEnd,
    });
    onChange(text);
    // React re-renders the controlled field and moves the caret to the end; restore it after commit.
    requestAnimationFrame(() => {
      field.focus();
      field.setSelectionRange(caret, caret);
    });
  };

  return (
    <div className="flex items-center gap-1" lang="de">
      {GERMAN_CHARS.map((char) => (
        <button
          key={char}
          type="button"
          disabled={disabled}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => insertChar(char)}
          className="w-11 h-11 rounded-lg border border-border-default bg-surface-inset hover:bg-surface-raised font-semibold text-base text-content-primary transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-default"
        >
          {char}
        </button>
      ))}
    </div>
  );
}
