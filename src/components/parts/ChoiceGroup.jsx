import React, { useRef } from 'react';
import { Check } from 'lucide-react';

const NEXT_KEYS = new Set(['ArrowRight', 'ArrowDown']);
const PREV_KEYS = new Set(['ArrowLeft', 'ArrowUp']);

function moveSelection(event, { options, value, onChange, buttonsRef }) {
  const step = NEXT_KEYS.has(event.key) ? 1 : (PREV_KEYS.has(event.key) ? -1 : 0);
  if (!step) return;
  event.preventDefault();
  const currentIndex = Math.max(0, options.findIndex((option) => option.value === value));
  const nextIndex = (currentIndex + step + options.length) % options.length;
  onChange(options[nextIndex].value);
  buttonsRef.current[nextIndex]?.focus();
}

// Compact (tablet row next to the statement): marker and check make way for the label.
const TABLET_HIDDEN = 'sm:max-lg:hidden';

function ChoiceButton({ option, isChecked, isFocusable, disabled, onChange, buttonRef, isCompact }) {
  return (
    <button
      ref={buttonRef}
      type="button"
      role="radio"
      aria-checked={isChecked}
      tabIndex={isFocusable ? 0 : -1}
      disabled={disabled}
      onClick={() => onChange(option.value)}
      className={`flex items-center gap-3 min-h-[3rem] px-4 py-3 rounded-xl border text-left text-base font-semibold transition-colors cursor-pointer disabled:cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 ${
        isChecked
          ? 'bg-action-primary border-action-primary text-white'
          : 'bg-surface-card border-border-default text-content-primary hover:border-border-strong hover:bg-surface-raised'
      }`}
    >
      {option.marker && (
        <span className={`w-7 h-7 shrink-0 rounded-lg flex items-center justify-center text-sm font-semibold ${isCompact ? TABLET_HIDDEN : ''} ${
          isChecked ? 'bg-white/20 text-white' : 'bg-surface-inset text-content-secondary'
        }`}>
          {option.marker}
        </span>
      )}
      <span className={`flex-1 leading-snug ${isCompact ? 'sm:max-lg:text-center' : ''}`}>{option.label}</span>
      {option.hotkey && !disabled && (
        <kbd aria-hidden="true" className="hidden lg:inline px-1.5 rounded border border-current text-xs font-sans font-normal opacity-50">{option.hotkey}</kbd>
      )}
      {isChecked && <Check className={`w-5 h-5 shrink-0 ${isCompact ? TABLET_HIDDEN : ''}`} aria-hidden="true" />}
    </button>
  );
}

// Selection stays neutral until results exist: colour must never hint at correctness mid-exam.
export default function ChoiceGroup({ options, value, onChange, disabled = false, ariaLabel, className = 'grid grid-cols-2 gap-2', isCompact = false }) {
  const buttonsRef = useRef([]);
  const hasValue = options.some((option) => option.value === value);

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={className}
      onKeyDown={(event) => !disabled && moveSelection(event, { options, value, onChange, buttonsRef })}
    >
      {options.map((option, index) => (
        <ChoiceButton
          key={option.value}
          option={option}
          isChecked={option.value === value}
          isFocusable={hasValue ? option.value === value : index === 0}
          disabled={disabled}
          onChange={onChange}
          isCompact={isCompact}
          buttonRef={(element) => { buttonsRef.current[index] = element; }}
        />
      ))}
    </div>
  );
}
