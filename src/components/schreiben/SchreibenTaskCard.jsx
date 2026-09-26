import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext.jsx';

/**
 * Situation and Leitpunkte of the letter. On phones it folds away while writing, so the text field gets the screen.
 */
export default function SchreibenTaskCard({ situation, leitpunkte = [], isCollapsed = false, onToggle }) {
  const { t } = useI18n();

  return (
    <div className="bg-surface-card rounded-2xl border border-border-default p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-content-secondary">Aufgabenstellung</h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={!isCollapsed}
          className="sm:hidden min-h-[44px] px-2 -mr-2 flex items-center gap-1 text-sm text-action-primary cursor-pointer"
        >
          {isCollapsed ? t('exam.showTask') : t('exam.collapseText')}
          <ChevronDown className={`w-4 h-4 transition-transform ${isCollapsed ? '' : 'rotate-180'}`} aria-hidden="true" />
        </button>
      </div>
      <div className={`space-y-4 ${isCollapsed ? 'max-sm:hidden' : ''}`}>
        <p lang="de" className="exam-text font-semibold text-content-primary">{situation}</p>
        <div className="space-y-2 pt-3 border-t border-border-default">
          <div className="text-sm font-semibold text-content-secondary">Leitpunkte (schreiben Sie zu allen 3 Punkten):</div>
          <ol className="space-y-2">
            {leitpunkte.map((point, idx) => (
              <li key={idx} lang="de" className="flex items-start gap-2.5 p-2.5 bg-surface-inset rounded-xl exam-text text-content-primary">
                <span className="w-6 h-6 rounded-full bg-action-primary text-white text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">{idx + 1}</span>
                <span className="leading-snug">{point}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
