import React from 'react';
import { resolveTutorCriterionFeedback } from '../../services/schreiben/feedback/tutorFeedbackResolver.js';
import { getCriterionColor } from './criterionColors.js';

const LEVEL_TEXT_CLASS = {
  2: 'text-state-success-text',
  1: 'text-state-warning-text',
  0: 'text-state-error-text',
};

/**
 * One criterion of the letter: tapping it cycles the self-check level (2 → 1 → 0).
 * A met criterion needs no note (the conclusion and the marked text already quote it);
 * the note explains only what is missing.
 */
export default function SchreibenCriterionRow({ criterionId, label, level, badgeText, diagnostic = {}, onCycle, language, cycleHint }) {
  const tutorNote = level < 2 && resolveTutorCriterionFeedback({
    criterionId,
    score: level,
    diagnosticCode: diagnostic.diagnosticCode,
    matchedSentence: diagnostic.matchedSentence || diagnostic.text,
    language,
  });

  return (
    <li className="py-1">
      <button
        type="button"
        onClick={() => onCycle?.(criterionId)}
        title={cycleHint}
        className="w-full min-h-[2.75rem] px-2 rounded-lg flex items-center justify-between gap-3 text-left hover:bg-surface-raised cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary"
      >
        <span className="flex items-center gap-2.5 min-w-0">
          <span aria-hidden="true" className={`w-2.5 h-2.5 rounded-full shrink-0 ${getCriterionColor(criterionId).dot}`} />
          <span className="text-sm font-medium text-content-primary">{label}</span>
        </span>
        <span className={`text-sm font-semibold tabular-nums shrink-0 ${LEVEL_TEXT_CLASS[level] || LEVEL_TEXT_CLASS[0]}`}>
          {badgeText}
        </span>
      </button>
      {tutorNote && (
        <p className="pl-7 pr-2 pb-1 text-sm leading-relaxed text-content-secondary">{tutorNote}</p>
      )}
    </li>
  );
}
