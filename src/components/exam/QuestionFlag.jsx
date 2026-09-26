import React, { createContext, useContext } from 'react';
import { Flag } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext.jsx';

const QuestionFlagContext = createContext(null);

export const QuestionFlagProvider = QuestionFlagContext.Provider;

export function QuestionFlagButton({ questionId }) {
  const { t } = useI18n();
  const flagState = useContext(QuestionFlagContext);
  if (!flagState || flagState.isSubmitted) return null;

  const isFlagged = Boolean(flagState.flags[questionId]);
  return (
    <button
      type="button"
      onClick={() => flagState.toggleFlag(questionId)}
      aria-pressed={isFlagged}
      aria-label={t('exam.flagToggle')}
      title={t('exam.flagToggle')}
      className={`w-11 h-11 -my-2 shrink-0 rounded-lg flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary ${
        isFlagged ? 'text-state-warning' : 'text-content-muted hover:text-content-secondary hover:bg-surface-raised'
      }`}
    >
      <Flag className={`w-4 h-4 ${isFlagged ? 'fill-current' : ''}`} />
    </button>
  );
}
