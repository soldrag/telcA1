import React from 'react';
import { resolveTutorCriterionFeedback } from '../../services/schreiben/feedback/tutorFeedbackResolver.js';

const LEVEL_BADGE_CLASS = {
  2: 'bg-state-success text-white',
  1: 'bg-state-warning text-white',
  0: 'bg-surface-raised text-content-muted',
};

export default function SchreibenCriterionRow({ criterionId, label, level, badgeText, diagnostic = {}, onCycle, language }) {
  const tutorNote = resolveTutorCriterionFeedback({
    criterionId,
    score: level,
    diagnosticCode: diagnostic.diagnosticCode,
    matchedSentence: diagnostic.matchedSentence || diagnostic.text,
    language,
  });

  return (
    <div className="w-full text-left p-3 rounded-lg border border-border-default bg-surface-card hover:border-action-primary transition-all space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onCycle?.(criterionId)}
          className="flex-1 text-left cursor-pointer text-xs font-bold hover:text-action-primary transition-colors"
        >
          <span className={level > 0 ? 'text-content-primary' : 'text-content-muted'}>{label}</span>
        </button>
        <button
          type="button"
          onClick={() => onCycle?.(criterionId)}
          className={`font-mono text-[11px] px-2 py-0.5 rounded font-black transition-colors cursor-pointer flex-shrink-0 ${LEVEL_BADGE_CLASS[level] || LEVEL_BADGE_CLASS[0]}`}
        >
          {badgeText}
        </button>
      </div>

      {tutorNote && (
        <div className="text-[11px] leading-relaxed text-content-secondary border-t border-border-subtle/50 pt-1.5 flex items-start space-x-1.5">
          <span className="text-action-primary font-bold flex-shrink-0">💡</span>
          <span>{tutorNote}</span>
        </div>
      )}
    </div>
  );
}
